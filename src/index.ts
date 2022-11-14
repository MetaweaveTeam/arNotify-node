import { welcome, env, app, db } from "./config";
import { Request, Response } from "express";
import { getCookie } from "./config/http";
import { TwitterApi } from "twitter-api-v2";
const OAUTH_COOKIE = "oauth_token";
const USER_COOKIE = "user_cookie";

interface RequestWithSession extends Request {
  session: any;
}

let appKey = process.env.CONSUMER_KEY || "INVALID";
let appSecret = process.env.CONSUMER_SECRET || "INVALID";

const client = new TwitterApi({
  appKey: appKey,
  appSecret: appSecret,
});
welcome();

app.get("/", (req: Request, res: Response) => {
  res.send("");
});

app.get("/users", async (req: RequestWithSession, res: Response) => {
  let result = await db.fetchAllSubscribedUsers();
  res.send(result);
});

// OAuth Step 1
app.post(
  "/twitter/oauth/request_token",
  async (req: RequestWithSession, res: Response, next) => {
    try {
      const { url, oauth_token, oauth_token_secret, oauth_callback_confirmed } =
        await client.generateAuthLink(process.env.FRONTEND_URL);

      if (oauth_callback_confirmed !== "true") {
        res.status(500).json({});
      }

      req.session.oauth_token_secret = oauth_token_secret;
      req.session.save(function (err: any) {
        if (err) next(err);
      });

      console.log(req.session);

      res.cookie(OAUTH_COOKIE, oauth_token, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        // secure: true,
        // httpOnly: true,
        // sameSite: true,
        // signed: true,
      });

      res.json({ oauth_token, url });
    } catch (e) {
      console.error(e);
      res.status(500).json({});
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
        return res
          .status(400)
          .send("You denied the app or your session expired!");
      }
      // Obtain the persistent tokens
      // Create a client from temporary tokens
      const client = new TwitterApi({
        appKey: appKey,
        appSecret: appSecret,
        accessToken: oauth_token as string,
        accessSecret: oauth_token_secret as string,
      });

      let {
        client: loggedClient,
        accessToken,
        accessSecret,
      } = await client.login(oauth_verifier as string);
      // loggedClient is an authenticated client in behalf of some user
      // Store accessToken & accessSecret somewhere

      let user = await loggedClient.currentUser();
      console.log(user);
    } catch (e: any) {
      res.status(403).send("Invalid verifier or access tokens!");
    }
  }
);

//Authenticated resource access
app.get("/twitter/users/profile_banner", async (req, res) => {
  try {
    const user = getCookie(req, USER_COOKIE);

    let userInfo = await db.fetchUserInfoByTwitterID(user.twitter_id);

    res.status(200).json({
      twitter_id: userInfo.twitter_id,
      twitter_handle: userInfo.twitter_handle,
      arweave_address: userInfo.arweave_address,
      is_subscribed: userInfo.is_subscribed,
      photo_url: userInfo.photo_url,
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Missing, invalid, or expired tokens" });
  }
});

app.post("/twitter/subscribe", async (req, res) => {});

app.post("/twitter/unsubscribe", async (req, res) => {});

app.post("/twitter/logout", async (req, res) => {
  try {
    const user = getCookie(req, USER_COOKIE);

    user.oauth_access_token = "";
    user.oauth_access_token_iv = "";
    user.oauth_secret_token = "";
    user.oauth_secret_token_iv = "";

    await db.updateUserInfo(user);

    res.cookie(OAUTH_COOKIE, {}, { maxAge: -1 });
    res.cookie(USER_COOKIE, {}, { maxAge: -1 });
    res.json({ success: true });
  } catch (error) {
    res.status(403).json({ message: "Missing, invalid, or expired tokens" });
  }
});

app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Listening on http://localhost:${env.PORT}`);
});
