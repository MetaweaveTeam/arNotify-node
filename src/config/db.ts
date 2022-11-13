const mysql = require('mysql2');
const env = process.env

const connection = mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

connection.connect((err: any) => {
  if (err) {
    console.error('❌[mysql]: error connecting: ' + err.stack);
    process.exit()
  }
  console.log(`⚡️[mysql]: connected as id ${connection.threadId} at ${env.DB_HOST}:${env.DB_PORT}`);
});

export default connection;
