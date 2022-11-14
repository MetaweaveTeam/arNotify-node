import { welcome, env, app, db } from "./config";
import { Request, Response } from "express";
const OAUTH_COOKIE = "oauth_token";
const USER_COOKIE = "user_cookie";

welcome();

app.get("/", (req: Request, res: Response) => {
  res.send("");
});

app.get("/users", async (req: Request, res: Response) => {
  let result = await db.fetchAllSubscribedUsers();
  res.send(result);
});

app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Listening on http://localhost:${env.PORT}`);
});
