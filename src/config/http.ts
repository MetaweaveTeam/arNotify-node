import express from "express";
import helmet from "helmet";
import cors from "cors";
var morgan = require("morgan");
import type { ErrorRequestHandler } from "express";
const cookieParser = require("cookie-parser");
import { Request } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  next(err);
};
const app = express();

app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse json request body
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body
app.use(morgan("combined"));
app.use(cookieParser(process.env.COOKIE_SECRET));
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
