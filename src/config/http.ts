import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import type { ErrorRequestHandler } from "express";
import { Request } from "express";
import { UserCookie } from "../types";
import session from "express-session";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { UnauthorizedError } from "./error";

dotenv.config();

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  next(err);
};

const app = express();

let sess = {
  resave: false,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    signed: true,
  },
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

sess.cookie.secure = true; // serve secure cookies

var corsOptions = {
  origin: process.env.FRONTEND_URL || "https://localhost:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(session(sess as any));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse json request body
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body
app.use(morgan("combined")); // HTTP logger (if needed)
app.use(errorHandler);

// extracts cookie from signedCookies area, throws error if not
export function getCookie(req: Request, cookieName: String): UserCookie {
  let cookies = req.signedCookies[cookieName as any];
  if (Array.isArray(cookies)) {
    return cookies[0] as UserCookie;
  } else if (cookies) {
    return cookies as UserCookie;
  } else {
    throw new UnauthorizedError("credentials invalid or expired");
  }
}

export default app;
