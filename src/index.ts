import { welcome, env, app, db } from './config';
import { Request, Response } from 'express';

welcome();

app.get('/', (req: Request, res: Response) => {
  res.send('Express Server.');
});

app.get('/add/:user/:location', (req: Request, res: Response) => {
  console.log("add user");
  
  const user = {
    name: req.params.user,
    location: req.params.location,
  };

  db.query('INSERT INTO users SET ?', user, (err: any, result: any) => {
    if (err) throw err;
    res.send('User added to database with ID: ' + result.insertId);
  });
});

app.get('/users', (req: Request, res: Response) => {
  db.query('SELECT * FROM users', (err: any, result: any) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(env.PORT, () => {
  console.log(`⚡️[server]: Listening on http://localhost:${env.PORT}`);
});
