import { welcome, env, app, db } from "./config";
import { Request, Response } from "express";
import type { ErrorRequestHandler } from "express";

welcome();

app.get("/", (req: Request, res: Response) => {
  res.send("");
});

app.get("/add/:user/:location", async (req: Request, res: Response) => {
  console.log("add user");

  const user = {
    name: req.params.user,
    location: req.params.location,
  };

  (await db.getConnection()).query(
    "INSERT INTO users SET ?",
    user,
    (err: any, result: any) => {
      if (err) throw err;
      res.send("User added to database with ID: " + result.insertId);
    }
  );
});

app.get("/users", async (req: Request, res: Response) => {
  let result = await (await db.getConnection()).query("SELECT * FROM users");
  res.send(result);
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  next(err);
};
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Listening on http://localhost:${env.PORT}`);
});
