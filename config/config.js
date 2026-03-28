import pkg from "pg";
const { Pool } = pkg;

// importing env and using env in index.js
import dotenv from "dotenv";
dotenv.config();

// connecting db as pool for further use
const pool = new Pool({
  connectionString: process.env.DB_URI,
});
// confirming DB connection !
pool
  .connect()
  .then(() => console.log("DB Connected ✅"))
  .catch((err) => console.error("DB Connection Failed ❌", err));

pool.on("error", (err, client) => {
    console.error("Unexpected error on idle client", err);
});
export default pool
