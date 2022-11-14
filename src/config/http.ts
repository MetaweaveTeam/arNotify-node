import express from "express";
import helmet from "helmet";
import cors from "cors";
const morgan = require("morgan");
import type { ErrorRequestHandler } from "express";
import { Request } from "express";
const session = require("express-session");
require("dotenv").config();

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  next(err);
};
const app = express();

// Please note that secure: true is a recommended option. However,
// it requires an https-enabled website, i.e., HTTPS is necessary for secure cookies.
// If secure is set, and you access your site over HTTP, the cookie will not be set.
//If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express:
// app.set('trust proxy', 1)
let sess = {
  resave: false,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    secure: false,
    // httpOnly: true,
    // sameSite: true,
    // signed: true
  },
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

if (process.env.MODE === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse json request body
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body
app.use(morgan("combined"));
app.use(errorHandler);

app.use(cors());
if (process.env.MODE === "production") app.options("arweave.net", cors());
else app.options("localhost:*", cors());

export function getCookie(req: Request, cookieName: String) {
  let cookies = req.signedCookies[cookieName as any];
  if (Array.isArray(cookies)) {
    return cookies[0];
  } else return cookies;
}

export default app;
