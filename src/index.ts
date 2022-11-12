import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connection from './config/db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server.');
});

app.get('/add/:user/:location', (req: Request, res: Response) => {
  const user = {
    name: req.params.user,
    location: req.params.location,
  };

  connection.query('INSERT INTO users SET ?', user, (err: any, result: any) => {
    if (err) throw err;
    res.send('User added to database with ID: ' + result.insertId);
  });
});

app.get('/users', (req: Request, res: Response) => {
  connection.query('SELECT * FROM users', (err: any, result: any) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
