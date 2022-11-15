import arweaveHelper from "./arweave_helper";
import axios from "axios";
import { request } from "graphql-request";
import { decrypt } from "./crypto";
import { EUploadMimeType, TwitterApi } from "twitter-api-v2";
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

const rateLimitPlugin = new TwitterApiRateLimitPlugin();

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

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
      let picTx = await arweave.transactions.get(picTxID);

      let fileType = "";
      for (let tag of picTx.tags) {
        if (arweave.utils.b64UrlToString(tag.name) === "Content-Type") {
          fileType = arweave.utils.b64UrlToString(tag.value);
        }
      }

      if (fileType === "") {
        console.debug("couldn't figure out filetype, continuing");
        continue;
      }

      // we fetch from arweave
      let img = await axios.get(arweaveHelper.ARWEAVE_GATEWAY + "/" + picTxID, {
        responseType: "arraybuffer",
      });

      if (
        fileType != EUploadMimeType.Gif &&
        fileType != EUploadMimeType.Jpeg &&
        fileType != EUploadMimeType.Png &&
        fileType != EUploadMimeType.Webp &&
        fileType != EUploadMimeType.Srt &&
        fileType != EUploadMimeType.Mp4
      ) {
        console.debug("invalid file type, continuing");
        continue;
      }

      let mediaId = await client.v1.uploadMedia(img.data, {
        mimeType: fileType,
        type: fileType,
      });
      mediaIDs.push(mediaId);
    } catch (e: any) {
      // console.debug("could not upload media, error: ", e);
      console.error("media not uploaded, continuing...");
    }
  }
  let formattedText = formatToTwitter(message);
  formattedText.push(
    `Tweet originally published at ${METAWEAVE_URL}${arweaveTxID} @MetaweaveTeam`
  );

  let tweets = [];

  for (let [id, txt] of formattedText.entries()) {
    if (id === 0) {
      tweets.push({ status: txt, media_ids: mediaIDs });
    } else {
      tweets.push({ status: txt });
    }
  }

  let res = await client.v1.tweetThread(tweets);

  return { id_str: res[0].id_str };
}

export default function start() {
  // Schedule tasks to be run on the server.
  cron.schedule(CRON_SCHEDULE, async function () {
    console.log("running Argora to Twitter task");
    // for every subscribed user we
    let subscribers = (await db.fetchAllSubscribedUsers()) as UserSub[];

    for (let sub of subscribers) {
      try {
        // fetch the latest argora messages
        let res = await request(
          arweaveHelper.ARWEAVE_GQL_ENDPOINT,
          arweaveHelper.argoraQuery(
            [sub.arweave_address],
            +sub.from_block_height
          )
        );

        // we reverse the array to start with the older message first
        let txs = res.transactions.edges.reverse();
        for (let tx of txs) {
          let txID = tx.node.id;
          if ((await db.getTweet(txID)).length === 0) {
            let newRes = (
              await axios.get(arweaveHelper.ARWEAVE_GATEWAY + "/" + txID)
            ).data;

            let data = newRes.data ? newRes.data : newRes["_data"];

            let message = data.text;
            if (message === undefined) {
              continue;
            }
            let pics = data.pictures;
            let pictures = pics === undefined ? [] : pics;
            console.debug("uploading message", message);
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
            console.debug("uploaded to twitter", message);
            console.debug("saving message");
            await db.saveTweetInfo(
              sub.twitter_id,
              twitterRes.id_str,
              txID,
              sub.protocol_name
            );
            console.debug("message saved");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}
