# arNotify-node

Node server for [arNotify](https://github.com/MetaweaveTeam/arNotify)

**Development environment requirements:** You'll need docker and docker-compose installed on your system.
As well you will need to provide a key/certificate for the https server to work:


## Development

### Requirements

You'll need docker and docker-compose installed on your system.

### Getting started

1. `$ git clone git@github.com:MetaweaveTeam/arNotify-node.git`
2. `$ cd arNotify-node`
3. you'll need to generate a key/certificate for the https server:
```sh
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/privkey.pem -out certs/cert.pem
```
4. `$ npm install`
5. `$ npm start`

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

If running a frontend app, or making a request to the backend from a browser during development, make sure to visit the URL of the server (https://localhost:3000). You will be shown an error message saying the certificate is not trusted. Click "Proceed Anyway" and this will let your browser know you trust your own self signed certificate and thus will allow you to make requests to the backend.
