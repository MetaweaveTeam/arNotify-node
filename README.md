# arNotify-node

Node server for [arNotify](https://github.com/MetaweaveTeam/arNotify)

**Development environment:** You'll need docker and docker-compose installed on your system.

## Getting started

1. `$ git clone git@github.com:MetaweaveTeam/arNotify-node.git && cd arNotify-node`
2. `$ npm install`
3. `$ npm start`

You'll have the following services running:

- express server: localhost:3000
- phpmyadmin: localhost:4000
- mysql server: localhost:3306

## Stop all containers

`$ npm stop`

This will stop the mysql and phpmyadmin server containers

## Running instructions

First copy the `.env.dev_example` and rename to `.env`

Set the necessary env variables. You will need the `TWITTER_CONSUMER_KEY` and `TWITTER_CONSUMER_SECRET` from twitter.

On Twitter, in the App page, under `User authentication settings`, ensure to add the `FRONTEND_URL` to the `Callback URI / Redirect URL`. For example, if running this locally the `FRONTEND_URL` would be `https://localhost:5173/`.

Note that we are using HTTPS for both the frontend and the backend (this is required for our session and cookies).

To setup a self signed certificate, run go into the `certs` directory and run `./create_certs.sh`. You can simply press enter until the certs are created.

From root, you can run `npm start` and the server should be running.
