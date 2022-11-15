import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import type { ErrorRequestHandler } from "express";
import { Request } from "express";
import { UserCookie } from "../types";
import session from "express-session";
import * as dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

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
    secure: true,
    httpOnly: true,
    sameSite: "none", // for now
    signed: true,
  },
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

// if (process.env.MODE === "production") {
app.set("trust proxy", 1); // trust first proxy
sess.cookie.secure = true; // serve secure cookies
// }
var corsOptions = {
  origin: "https://localhost:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// if (process.env.MODE === "production") app.options("arweave.net", cors());
// else app.options("localhost:*", cors());
// app.options("*", cors());
// app.options("http://localhost:5173", cors());

app.use(session(sess as any));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse json request body
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body
app.use(morgan("combined"));
app.use(errorHandler);

export function getCookie(req: Request, cookieName: String): UserCookie {
  let cookies = req.signedCookies[cookieName as any];
  if (Array.isArray(cookies)) {
    return cookies[0] as UserCookie;
  } else if (cookies) {
    return cookies as UserCookie;
  } else {
    throw new Error("no cookie");
  }
}

export default app;
