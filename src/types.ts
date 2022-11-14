export type User = {
  twitter_id: String;
  twitter_handle: String;
  photo_url: String;
  oauth_access_token: String;
  oauth_access_token_iv: String;
  oauth_secret_token: String;
  oauth_secret_token_iv: String;
};

export type UserCookie = {
  twitter_id: String;
  twitter_handle: String;
  photo_url: String;
  logged_in_method: String;
};

export type Subscription = {
  id: String;
  twitter_id: String;
  arweave_address: String;
  protocol_name: String;
  from_block_height: String;
  is_active: Number;
};
