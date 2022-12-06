import { welcome, env, app, db } from "./config";
import { Request, Response } from "express";
import { getCookie } from "./config/http";
import { TwitterApi, UserV1 } from "twitter-api-v2";
import { encrypt } from "./crypto";
import start from "./cron";
const https = require("https");
const fs = require("fs");

import {
  APP_KEY,
  APP_SECRET,
  OAUTH_COOKIE,
  PROTOCOL,
  Subscription,
  User,
  UserCookie,
  USER_COOKIE,
} from "./types";
import Arweave from "arweave";
import { client } from "./config/twitter";
import {
  DBError,
  handleAPIError,
  TwitterError,
  NotFoundError,
} from "./config/error";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

interface RequestWithSession extends Request {
  session: any;
}

welcome();

// OAuth Step 1
app.post(
  "/twitter/oauth/request_token",
  async (req: RequestWithSession, res: Response, next) => {
    try {
      const { url, oauth_token, oauth_token_secret, oauth_callback_confirmed } =
        await client.generateAuthLink(env.FRONTEND_URL);

      if (oauth_callback_confirmed !== "true") {
        throw new TwitterError(
          "error with the twitter api",
          "oauth_callback_confirmed was not confirmed"
        );
      }

      req.session.oauth_token_secret = oauth_token_secret;
      req.session.save(function (err: any) {
        if (err) {
          console.debug(err);
          next(err);
        }
      });

      res.cookie(OAUTH_COOKIE, oauth_token, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        secure: true,
        httpOnly: true,
        sameSite: "none",
        signed: true,
      });

      res.json({ oauth_token, url });
    } catch (e) {
      return handleAPIError(e, res);
    }
  }
);

// OAuth Step 3
app.post(
  "/twitter/oauth/access_token",
  async (req: RequestWithSession, res: Response) => {
    try {
      // Extract tokens from query string
      const { oauth_token, oauth_verifier } = req.query;
      // Get the saved oauth_token_secret from session
      const { oauth_token_secret } = req.session;
      if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        return res.status(400).json({
          error: "you denied the app or your session expired, please try again",
        });
      }
      // Obtain the persistent tokens
      // Create a client from temporary tokens
      const client = new TwitterApi({
        appKey: APP_KEY,
        appSecret: APP_SECRET,
        accessToken: oauth_token as string,
        accessSecret: oauth_token_secret as string,
      });

      let {
        client: loggedClient,
        accessToken,
        accessSecret,
      } = await client.login(oauth_verifier as string);
      let twitterUserData: UserV1;
      try {
        twitterUserData = await loggedClient.currentUser();
      } catch (e) {
        throw new TwitterError("internal error", e);
      }

      let user: User;

      let encAccessToken = encrypt(accessToken);
      let encTokenSecret = encrypt(accessSecret);

      let dbUser: any;
      try {
        dbUser = await db.fetchUserInfoByTwitterID(twitterUserData.id_str);
      } catch (e) {
        throw new DBError("internal error", e);
      }

      // if a brand new user
      if (dbUser.length === 0) {
        let res = await db.createNewUser({
          main_id: twitterUserData.id_str,
          main_handle: twitterUserData.screen_name,
          medium: "twitter",
          photo_url: twitterUserData.profile_image_url_https,
          oauth_access_token: encAccessToken.content,
          oauth_access_token_iv: encAccessToken.iv,
          oauth_secret_token: encTokenSecret.content,
          oauth_secret_token_iv: encTokenSecret.iv,
        });
        if (res.length === 0) {
          throw new DBError(
            "internal error",
            "[db]: could not create user " + res
          );
        }
        user = res[0];
      } else {
        user = dbUser[0];
        user.oauth_access_token = encAccessToken.content;
        user.oauth_access_token_iv = encAccessToken.iv;
        user.oauth_secret_token = encTokenSecret.content;
        user.oauth_secret_token_iv = encTokenSecret.iv;
        try {
          await db.updateUserInfo(user);
        } catch (e) {
          throw new DBError(
            "internal error",
            "[db]: could not update user" + e
          );
        }
      }
      res.cookie(
        USER_COOKIE,
        {
          main_id: user.main_id,
          main_handle: user.main_handle,
          photo_url: user.photo_url,
          medium: user.medium,
        } as UserCookie,
        {
          maxAge: 8 * 60 * 60 * 1000, // 8 hours
          secure: true,
          httpOnly: true,
          sameSite: "none",
          signed: true,
        }
      );
      res.status(200).json({
        main_id: user.main_id,
        main_handle: user.main_handle,
        photo_url: user.photo_url,
        expiry: Date.now() + 8 * 60 * 60 * 1000,
      });
    } catch (e: any) {
      return handleAPIError(e, res);
    }
  }
);

//Authenticated resource access
app.get("/twitter/users/me", async (req, res) => {
  try {
    const userCookie = getCookie(req, USER_COOKIE);

    let userInfo = await db.fetchUserInfoByTwitterID(userCookie.main_id);
    if (userInfo.length === 0) {
      throw new NotFoundError("user_by_twitter_id", "internal error");
    }

    let user = userInfo[0];
    res.status(200).json({
      main_id: user.main_id,
      main_handle: user.main_handle,
      is_subscribed: user.is_subscribed,
      photo_url: user.photo_url,
    });
  } catch (e) {
    return handleAPIError(e, res);
  }
});

app.post("/twitter/subscribe", async (req, res) => {
  try {
    let data = req.body;
    const user = getCookie(req, USER_COOKIE);

    // first check if we are already subscribed
    let sub = await db.subscription(user.main_id, data.address, PROTOCOL);
    // if already subscribed, we send back a 200
    if (sub.length > 0) {
      res
        .status(200)
        .json({ subscribed: true, address: data.address, protocol: PROTOCOL });
      return;
    }

    const blockHeight = (await arweave.blocks.getCurrent()).height;

    await db.subscribe(
      user.main_id,
      data.address,
      PROTOCOL,
      blockHeight.toString()
    );

    return res
      .status(200)
      .json({ subscribed: true, address: data.address, protocol: PROTOCOL });
  } catch (e) {
    return handleAPIError(e, res);
  }
});

app.post("/twitter/unsubscribe", async (req, res) => {
  try {
    const user = getCookie(req, USER_COOKIE);

    let data = req.body;

    let sub = await db.subscription(user.main_id, data.address, PROTOCOL);

    if (sub.length === 0) {
      throw new NotFoundError("subscription", "subscription not found");
    }

    await db.unsubscribe(user.main_id, data.address, PROTOCOL);

    res.json({ subscribed: false, address: data.address, protocol: PROTOCOL });
    return;
  } catch (e) {
    return handleAPIError(e, res);
  }
});

app.get("/subscriptions", async (req, res) => {
  try {
    const user = getCookie(req, USER_COOKIE);

    let result = await db.subscriptionsByUserID(user.main_id);

    res.status(200).send({ subscriptions: result as Subscription[] });
    return;
  } catch (e) {
    return handleAPIError(e, res);
  }
});

// exit actually removes the twitter connection, its subscriptions and logs out the user
app.post("/twitter/exit", async (req, res) => {
  try {
    const user = getCookie(req, USER_COOKIE);

    await db.unsubscribeToAll(user.main_id);
    await db.removeTwitterAccess(user.main_id);

    res.cookie(
      OAUTH_COOKIE,
      {},
      {
        maxAge: -1,
        secure: true,
        httpOnly: true,
        sameSite: "none",
        signed: true,
      }
    );
    res.cookie(
      USER_COOKIE,
      {},
      {
        maxAge: -1,
        secure: true,
        httpOnly: true,
        sameSite: "none",
        signed: true,
      }
    );

    res.json({ success: true });
  } catch (e) {
    return handleAPIError(e, res);
  }
});

// logout simply logs you out of the app, keeps the twitter connection
app.post("/logout", async (req, res) => {
  try {
    res.cookie(
      OAUTH_COOKIE,
      {},
      {
        maxAge: -1,
        secure: true,
        httpOnly: true,
        sameSite: "none",
        signed: true,
      }
    );
    res.cookie(
      USER_COOKIE,
      {},
      {
        maxAge: -1,
        secure: true,
        httpOnly: true,
        sameSite: "none",
        signed: true,
      }
    );
    res.json({ success: true });
  } catch (e) {
    return handleAPIError(e, res);
  }
});

// we start the cron job
start();

// we get our self signed certificates
var key = fs.readFileSync("./certs/selfsigned.key");
var cert = fs.readFileSync("./certs/selfsigned.crt");

console.log(`⚡️[server]: Listening on https://localhost:${env.PORT}`);
https.createServer({ key, cert }, app).listen(env.PORT);
