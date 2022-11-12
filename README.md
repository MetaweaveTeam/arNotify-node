# arNotify node

## Getting started

**Note:** For this project you need to have docker installed or use your own mysql database at `.env`

### Configuring .env

By default the .env value are configured for docker.
Here is the default `.env.template`

```sh
PORT=8000
DB_HOST=127.0.0.1
DB_NAME=arnotify
DB_USER=arnotify
DB_PASSWORD=arnotify
DB_ROOT_PASSWORD=arnotify
```

### Database configuration

#### Docker

- `$ docker compose up`

#### MySQL / MariaDB

**Note:** Coming Soon

### Starting Dev Server

- `$ npm i`

- `$ npm dev`
