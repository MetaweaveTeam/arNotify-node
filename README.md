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
