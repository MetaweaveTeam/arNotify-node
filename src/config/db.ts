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
  } finally {
    conn.release();
  }
}

(async () => {
  return await ensure_connected();
})();

async function query(q: string, args: any[]): Promise<any> {
  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(q, args);
  } catch (e: any) {
    throw e;
  } finally {
    conn.release();
  }
}

export default {
  fetchAllSubscribedUsers: async () => {
    return await query(
      "SELECT u.* FROM users u JOIN subscriptions s ON u.twitter_id = s.twitter_id WHERE s.is_active = 1 ",
      []
    );
  },

  fetchUserInfoByTwitterID: async (twitterID: String) => {
    return await query("SELECT * FROM users where users.twitter_id=?", [
      twitterID,
    ]);
  },

  subscriptionsByUserID: async (twitterID: String) => {
    return await query(
      "SELECT * FROM subscriptions s where s.twitter_id=? and s.is_active=1",
      [twitterID]
    );
  },

  subscription: async (
    twitterID: String,
    arweave_address: String,
    protocol: String
  ): Promise<any> => {
    return await query(
      `SELECT
      *
  FROM
      subscriptions s
  WHERE
      s.twitter_id = ? AND s.arweave_address = ? AND s.protocol_name = ? AND s.is_active = 1`,
      [twitterID, arweave_address, protocol]
    );
  },

  subscribe: async (
    twitterID: String,
    arweave_address: String,
    protocol: String,
    from_block_height: String
  ): Promise<Boolean> => {
    return await query(
      `INSERT INTO subscriptions(
        twitter_id,
        arweave_address,
        protocol_name,
        from_block_height,
        is_active
    )
    VALUES(?, ?, ?, ?, 1)
      `,
      [twitterID, arweave_address, protocol, from_block_height]
    );
  },

  unsubscribe: async (
    twitterID: String,
    arweave_address: String,
    protocol: String
  ): Promise<Boolean> => {
    return await query(
      `UPDATE
      subscriptions s
  SET
      is_active = 0
  WHERE
      s.twitter_id = ? AND s.arweave_address = ? AND s.protocol_name = ?
      `,
      [twitterID, arweave_address, protocol]
    );
  },

  getTweet: async (txID: String) => {
    return await query("SELECT * FROM tweets where tweets.arweave_tx_id=?", [
      txID,
    ]);
  },

  createNewUser: async (user: User) => {
    return await query(
      `INSERT INTO users(
        twitter_id,
        twitter_handle,
        photo_url,
        oauth_access_token,
        oauth_access_token_iv,
        oauth_secret_token,
        oauth_secret_token_iv
    )
    VALUES(?, ?, ?, ?, ?, ?, ?) RETURNING twitter_id, twitter_handle, photo_url`,
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
    return await query(
      `UPDATE
      users
      SET
      twitter_handle = ?,
      photo_url = ?,
      oauth_access_token = ?,
      oauth_access_token_iv = ?,
      oauth_secret_token = ?,
      oauth_secret_token_iv = ?
      WHERE
      users.twitter_id = ?`,
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

  removeTwitterAccess: async (twitterID: String) => {
    return await query(
      `UPDATE
      users
  SET
      oauth_access_token = ?,
      oauth_access_token_iv = ?,
      oauth_secret_token = ?,
      oauth_secret_token_iv = ?
  WHERE
      users.twitter_id = ?`,
      ["", "", "", "", twitterID]
    );
  },

  saveTweetInfo: async (user: User, arweave_tx_id: String, tweetID: String) => {
    return await query(
      "INSERT INTO tweets (twitter_id, tweet_id, arweave_tx_id) VALUES (?, ?, ?)",
      [user.twitter_id, arweave_tx_id, tweetID]
    );
  },
};
