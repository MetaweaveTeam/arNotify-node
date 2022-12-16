import { User } from "../types";

import mariadb from "mariadb";
const env = process.env;

const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT ? +env.DB_PORT : 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 5,
});

async function ensure_connected() {
  let conn;
  try {
    conn = await pool.getConnection();
    let res = (await conn.query("SELECT * from protocols")).filter(
      (elem: any) => elem.protocol_name === "argora"
    );

    if (res.length === 0) {
      throw new Error(
        "[mariadb]: error, could not fetch protocols table, ensure your DB is properly migrated"
      );
    }
    console.log(
      `⚡️[mariadb]: connected as id ${conn.threadId} at ${env.DB_HOST}:${env.DB_PORT}`
    );
  } catch (err) {
    console.log("❌[mariadb]: error connecting:  " + err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
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
    if (conn) conn.release();
    throw e;
  } finally {
    if (conn) conn.release();
  }
}

export default {
  fetchAllSubscribedUsers: async () => {
    return await query(
      `SELECT
      u.*,
      s.arweave_address,
      s.protocol_name,
      s.from_block_height,
      s.is_active
  FROM
      users u
  JOIN subscriptions s ON
      u.main_id = s.main_id
  WHERE
      s.is_active = 1 `,
      []
    );
  },

  fetchUserInfoByTwitterID: async (twitterID: String) => {
    return await query(
      "SELECT * FROM users where users.main_id=? AND medium='twitter'",
      [twitterID]
    );
  },

  subscriptionsByUserID: async (twitterID: String) => {
    return await query(
      "SELECT * FROM subscriptions s where s.main_id=? and s.is_active=1",
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
      s.main_id = ? AND s.arweave_address = ? AND s.protocol_name = ? AND s.is_active = 1`,
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
        main_id,
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
      s.main_id = ? AND s.arweave_address = ? AND s.protocol_name = ?
      `,
      [twitterID, arweave_address, protocol]
    );
  },

  unsubscribeToAll: async (twitterID: String): Promise<Boolean> => {
    return await query(
      `UPDATE
      subscriptions s
  SET
      is_active = 0
  WHERE
      s.main_id = ?
      `,
      [twitterID]
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
        main_id,
        main_handle,
        medium,
        followers_count,
        arweave_address,
        photo_url,
        oauth_access_token,
        oauth_access_token_iv,
        oauth_secret_token,
        oauth_secret_token_iv
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING main_id, main_handle, followers_count, arweave_address, photo_url, medium`,
      [
        user.main_id,
        user.main_handle,
        user.medium,
        user.followers_count,
        user.arweave_address,
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
      main_handle = ?,
      photo_url = ?,
      followers_count = ?,
      arweave_address = ?,
      oauth_access_token = ?,
      oauth_access_token_iv = ?,
      oauth_secret_token = ?,
      oauth_secret_token_iv = ?
      WHERE
      users.main_id = ?`,
      [
        user.main_handle,
        user.photo_url,
        user.followers_count,
        user.arweave_address,
        user.oauth_access_token,
        user.oauth_access_token_iv,
        user.oauth_secret_token,
        user.oauth_secret_token_iv,
        user.main_id,
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
      users.main_id = ?`,
      ["", "", "", "", twitterID]
    );
  },

  saveTweetInfo: async (
    twitterID: String,
    tweetID: String,
    arweave_tx_id: String,
    protocol: String
  ) => {
    return await query(
      "INSERT INTO tweets (main_id, tweet_id, arweave_tx_id, protocol_name) VALUES (?, ?, ?, ?)",
      [twitterID, tweetID, arweave_tx_id, protocol]
    );
  },

  countTweetsByTwitterID: async (twitterID: String) => {
    return await query(
      "SELECT COUNT(*) as count FROM tweets where tweets.main_id=?",
      [twitterID]
    );
  },
};
