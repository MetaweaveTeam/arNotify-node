const mariadb = require("mariadb");
const env = process.env;

const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 5,
});

async function ensure_connected() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("SELECT 1 as val");
    console.log(
      `⚡️[mariadb]: connected as id ${conn.threadId} at ${env.DB_HOST}:${env.DB_PORT}`
    );
  } catch (err) {
    console.log("❌[mariadb]: error connecting:  " + err);
    process.exit(1);
  }
}

(async () => {
  return await ensure_connected();
})();

export default pool;
