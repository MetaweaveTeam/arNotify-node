import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse json request body
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body

app.use(cors());
if(process.env.MODE === "production")
  app.options('arweave.net', cors());
else
  app.options('localhost:*', cors());

export default app;