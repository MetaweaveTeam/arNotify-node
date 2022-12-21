require("dotenv").config();

const env = process.env;

module.exports = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  port: env.DB_PORT ? +env.DB_PORT : 3306,
  dialect: "mariadb",
};
