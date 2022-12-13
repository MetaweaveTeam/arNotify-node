import { TwitterApi } from "twitter-api-v2";
import { APP_KEY, APP_SECRET } from "../types";

export const client = new TwitterApi({
  appKey: APP_KEY,
  appSecret: APP_SECRET,
});

export function earningRate(followers: number): number {
  let rate = 0;
  if (99 < followers && 10000 > followers) {
    rate = followers * 0.001;
  }

  if (10000 <= followers) {
    rate = 10000 * 0.001 + followers * 0.0001;
  }

  if (100000 <= followers) {
    rate = 10000 * 0.001 + 100000 * 0.0001 + followers * 0.00001;
  }

  if (100 >= rate) {
    rate = 100;
  }

  return rate.toFixed(2) as any;
}

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
