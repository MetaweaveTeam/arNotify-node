import { TwitterApi } from "twitter-api-v2";
import { APP_KEY, APP_SECRET } from "../types";

export const client = new TwitterApi({
  appKey: APP_KEY,
  appSecret: APP_SECRET,
});

async function init() {
  try {
    await client.generateAuthLink(process.env.FRONTEND_URL);
    console.log("⚡️[twitter]: successfully connected to twitter API");
  } catch (e) {
    console.error(
      "❌[twitter]: initialization failed, please check your twitter credentials or process.env.FRONTEND_URL"
    );
    process.exit(1);
  }
}

(async () => {
  return await init();
})();
