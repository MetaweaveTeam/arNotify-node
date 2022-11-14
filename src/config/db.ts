import { User } from "../types";

const mariadb = require("mariadb");
const env = process.env;

const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 5,
});

async function ensure_connected() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("SELECT 1 as val");
    console.log(
      `⚡️[mariadb]: connected as id ${conn.threadId} at ${env.DB_HOST}:${env.DB_PORT}`
    );
  } catch (err) {
    console.log("❌[mariadb]: error connecting:  " + err);
    process.exit(1);
  }
}

(async () => {
  return await ensure_connected();
})();

export default {
  fetchAllSubscribedUsers: async () => {
    return await (
      await pool.getConnection()
    ).query(
      "SELECT u.* FROM users u JOIN subscriptions s ON u.twitter_id = s.twitter_id WHERE s.is_active = 1 "
    );
  },

  fetchUserInfoByTwitterID: async (twitterID: String) => {
    return await (
      await pool.getConnection()
    ).query("SELECT * FROM users where users.twitter_id=?", [twitterID]);
  },

  getTweet: async (txID: String) => {
    return await (
      await pool.getConnection()
    ).query("SELECT * FROM tweets where tweets.arweave_tx_id=?", [txID]);
  },

  createNewUser: async (user: User) => {
    return await (
      await pool.getConnection()
    ).query(
      "INSERT INTO users (twitter_id, twitter_handle, photo_url, oauth_access_token, oauth_access_token_iv, oauth_secret_token,oauth_secret_token_iv) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.twitter_id,
        user.twitter_handle,
        user.photo_url,
        user.oauth_access_token,
        user.oauth_access_token_iv,
        user.oauth_secret_token,
        user.oauth_secret_token_iv,
      ]
    );
  },

  updateUserInfo: async (user: User) => {
    return await (
      await pool.getConnection()
    ).query(
      "UPDATE users SET twitter_handle=?, photo_url=? oauth_access_token=?, oauth_access_token_iv=?, oauth_secret_token=?, oauth_secret_token_iv=? where users.twitter_id=?  ",
      [
        user.twitter_handle,
        user.photo_url,
        user.oauth_access_token,
        user.oauth_access_token_iv,
        user.oauth_secret_token,
        user.oauth_secret_token_iv,
        user.twitter_id,
      ]
    );
  },

  saveTweetInfo: async (user: User, arweave_tx_id: String, tweetID: String) => {
    return await (
      await pool.getConnection()
    ).query(
      "INSERT INTO tweets (twitter_id, tweet_id, arweave_tx_id) VALUES (?, ?, ?)",
      [user.twitter_id, arweave_tx_id, tweetID]
    );
  },
};
