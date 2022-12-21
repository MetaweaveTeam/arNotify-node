CREATE TABLE IF NOT EXISTS users(
    main_id VARCHAR(255) NOT NULL PRIMARY KEY,
    main_handle TEXT NOT NULL UNIQUE,
    followers_count INT NOT NULL,
    arweave_address TEXT NOT NULL,
    medium TEXT NOT NULL,
    photo_url TEXT,
    oauth_access_token TEXT,
    oauth_access_token_iv TEXT,
    oauth_secret_token TEXT,
    oauth_secret_token_iv TEXT
);

CREATE TABLE IF NOT EXISTS protocols(
    protocol_name VARCHAR(255) NOT NULL PRIMARY KEY
);


CREATE TABLE IF NOT EXISTS tweets(
    tweet_id VARCHAR(255) NOT NULL PRIMARY KEY,
    main_id VARCHAR(255),
    arweave_tx_id TEXT NOT NULL,
    protocol_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (main_id) REFERENCES users(main_id),
    FOREIGN KEY (protocol_name) REFERENCES protocols(protocol_name)
);


CREATE TABLE IF NOT EXISTS subscriptions(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    main_id VARCHAR(255) NOT NULL,
    arweave_address TEXT NOT NULL,
    protocol_name VARCHAR(255) NOT NULL,
    from_block_height INT NOT NULL,
    is_active BOOLEAN,
    FOREIGN KEY (main_id) REFERENCES users(main_id),
    FOREIGN KEY (protocol_name) REFERENCES protocols(protocol_name)
);

INSERT INTO protocols (protocol_name) VALUES ("argora");
