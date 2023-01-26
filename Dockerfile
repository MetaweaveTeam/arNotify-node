FROM node:18

WORKDIR /home/node/app
COPY src src/
COPY package.json .
COPY tsconfig.json .
COPY .env.prod .env
COPY .sequelizerc .

# RUN npm config set unsafe-perm true
RUN npm i
RUN npm run build

CMD ["node", "dist"]
# CMD ["tail", "-f", "/dev/null"]
