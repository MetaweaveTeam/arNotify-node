export type User = {
  main_id: String;
  main_handle: String;
  medium: String;
  followers_count: Number;
  earning_rate: Number;
  arweave_address: String;
  photo_url: String;
  oauth_access_token: String;
  oauth_access_token_iv: String;
  oauth_secret_token: String;
  oauth_secret_token_iv: String;
};

export type UserCookie = {
  main_id: String;
  main_handle: String;
  photo_url: String;
  medium: String;
};

export type Subscription = {
  id: String;
  main_id: String;
  arweave_address: String;
  protocol_name: String;
  from_block_height: String;
  is_active: Number;
};

export type UserSub = {
  main_id: String;
  main_handle: String;
  medium: String;
  photo_url: String;
  oauth_access_token: String;
  oauth_access_token_iv: String;
  oauth_secret_token: String;
  oauth_secret_token_iv: String;
  arweave_address: String;
  protocol_name: String;
  from_block_height: String;
  is_active: Number;
};

export const OAUTH_COOKIE = "oauth_token";
export const USER_COOKIE = "user_cookie";
export const PROTOCOL = "argora";

export const APP_KEY = process.env.TWITTER_CONSUMER_KEY || "INVALID";
export const APP_SECRET = process.env.TWITTER_CONSUMER_SECRET || "INVALID";
export const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "INVALID";
export const ENCRYPTION_ALGO = "aes-256-ctr";
export const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_KEY || "INVALID";
export const METAWEAVE_URL = "https://r.metaweave.xyz/t/";
