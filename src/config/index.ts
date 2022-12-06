import app from "./http";
import welcome from "./welcomeMessage";
import db from "./db";

const env = process.env;

export { env, db, app, welcome };
