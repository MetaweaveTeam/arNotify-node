import arweaveHelper from "./arweave_helper";
import axios, { AxiosResponse } from "axios";
import { request } from "graphql-request";
import { decrypt } from "./crypto";
import { EUploadMimeType, TweetV1, TwitterApi } from "twitter-api-v2";
import { db } from "./config";
import {
  APP_KEY,
  APP_SECRET,
  CRON_SCHEDULE,
  METAWEAVE_URL,
  UserSub,
} from "./types";
import cron from "node-cron";
import Arweave from "arweave";
import { TwitterApiRateLimitPlugin } from "@twitter-api-v2/plugin-rate-limit";
import Transaction from "arweave/node/lib/transaction";
import {
  ArweaveError,
  DBError,
  handleCronError,
  TwitterCronError,
} from "./config/error";

const rateLimitPlugin = new TwitterApiRateLimitPlugin();

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

// formats a message to a twitter friendly one
function formatToTwitter(message: String) {
  let splitMsg = message.match(/[\s\S]{1,274}/g) || [];
  let tweets: RegExpMatchArray = [];

  if (splitMsg.length === 1) {
    tweets = splitMsg;
  } else {
    for (var i = 0; i < splitMsg.length; i++) {
      tweets.push(i + 1 + "/" + splitMsg.length + " " + splitMsg[i]);
    }
  }

  return tweets;
}

// posts messages to twitter. As we don't have fragmentation of messages on metaweave
// we post all the pictures in the first tweet.
async function postToTwitter(
  message: String,
  pictures: String,
  arweaveTxID: String,
  oauth_access_token: String,
  oauth_access_token_secret: String
) {
  const client = new TwitterApi(
    {
      appKey: APP_KEY,
      appSecret: APP_SECRET,
      accessToken: oauth_access_token,
      accessSecret: oauth_access_token_secret,
    } as any,
    { plugins: [rateLimitPlugin] }
  );

  let mediaIDs: string[] = [];
  for (let picTxID of pictures) {
    try {
      let picTx: Transaction;
      try {
        picTx = await arweave.transactions.get(picTxID);
      } catch (e) {
        throw new ArweaveError(
          "[cron]: could not get picture tx info from arweave " + picTxID,
          e
        );
      }

      let fileType = "";
      for (let tag of picTx.tags) {
        if (arweave.utils.b64UrlToString(tag.name) === "Content-Type") {
          fileType = arweave.utils.b64UrlToString(tag.value);
        }
      }

      // if we don't know what the filetype is, we continue as twitter won't accept it
      if (fileType === "") {
        console.debug(
          "[cron]: couldn't figure out filetype for media upload, continuing"
        );
        continue;
      }

      // we make sure Twitter accepts the file type, otherwise we continue
      if (
        fileType != EUploadMimeType.Gif &&
        fileType != EUploadMimeType.Jpeg &&
        fileType != EUploadMimeType.Png &&
        fileType != EUploadMimeType.Webp &&
        fileType != EUploadMimeType.Srt &&
        fileType != EUploadMimeType.Mp4
      ) {
        console.debug("[cron]: invalid file type for twitter API, continuing");
        continue;
      }

      // we fetch the file data from arweave
      let img: AxiosResponse<any, any>;
      try {
        img = await axios.get(arweaveHelper.ARWEAVE_GATEWAY + "/" + picTxID, {
          responseType: "arraybuffer",
        });
      } catch (e) {
        throw new ArweaveError(
          "[cron]: could not get picture data from arweave " + picTxID,
          e
        );
      }
      let mediaId: string;
      try {
        mediaId = await client.v1.uploadMedia(img.data, {
          mimeType: fileType,
          type: fileType,
        });
      } catch (e) {
        throw new TwitterCronError(
          "[cron]: could not upload media to twitter ",
          e
        );
      }

      mediaIDs.push(mediaId);
    } catch (e: any) {
      console.debug("[cron]: could not upload media, error: ", e);
    }
  }
  let formattedText = formatToTwitter(message);
  formattedText.push(
    `Tweet originally published at ${METAWEAVE_URL}${arweaveTxID} @MetaweaveTeam`
  );

  let tweets = [];

  for (let [id, txt] of formattedText.entries()) {
    // first tweet gets the pictures
    if (id === 0) {
      tweets.push({ status: txt, media_ids: mediaIDs });
    } else {
      // the rest do not
      tweets.push({ status: txt });
    }
  }
  let res: TweetV1[];
  try {
    res = await client.v1.tweetThread(tweets);
  } catch (e) {
    throw new TwitterCronError("[cron]: could not tweet thread to twitter ", e);
  }

  return { id_str: res[0].id_str };
}

export default function start() {
  // Schedule tasks to be run on the server.
  cron.schedule(CRON_SCHEDULE, async function () {
    console.debug("[cron]: running Argora to Twitter task");
    // for every subscribed user we
    let subscribers = (await db.fetchAllSubscribedUsers()) as UserSub[];

    for (let sub of subscribers) {
      try {
        // fetch the latest argora messages
        let res: any;

        try {
          res = await request(
            arweaveHelper.ARWEAVE_GQL_ENDPOINT,
            arweaveHelper.argoraQuery(
              [sub.arweave_address],
              +sub.from_block_height
            )
          );
        } catch (e) {
          throw new ArweaveError("could not make graphql query", e);
        }

        // we reverse the array to start with the older message first
        let txs = res.transactions.edges.reverse();
        for (let tx of txs) {
          let txID = tx.node.id;
          if ((await db.getTweet(txID)).length === 0) {
            let newRes: any;
            try {
              newRes = (
                await axios.get(arweaveHelper.ARWEAVE_GATEWAY + "/" + txID)
              ).data;
            } catch (e) {
              throw new ArweaveError(
                "could not get txID " + txID + " from arweave ",
                e
              );
            }

            // we check if the data is under the key .data or ."_data"
            let data = newRes.data ? newRes.data : newRes["_data"];

            // no  empty messages
            let message = data.text;
            if (message === undefined) {
              continue;
            }
            let pics = data.pictures;
            let pictures = pics === undefined ? [] : pics;
            console.debug("[cron]: uploading message", message);
            let oauthAccessToken = decrypt(
              sub.oauth_access_token,
              sub.oauth_access_token_iv
            );
            let oauthSecretToken = decrypt(
              sub.oauth_secret_token,
              sub.oauth_secret_token_iv
            );
            let twitterRes = await postToTwitter(
              message,
              pictures,
              txID,
              oauthAccessToken,
              oauthSecretToken
            );
            console.debug("[cron]: uploaded to twitter", message);
            console.debug("[cron]: saving message");
            try {
              await db.saveTweetInfo(
                sub.main_id,
                twitterRes.id_str,
                txID,
                sub.protocol_name
              );
              console.debug("[cron]: message saved");
            } catch (e) {
              throw new DBError("[cron]: could not save message in db", e);
            }
          }
        }
      } catch (e) {
        handleCronError(e);
      }
    }
  });
}
