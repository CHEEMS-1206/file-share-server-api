import pkg from "pg";
const { Pool } = pkg;

// importing env and using env in index.js
import dotenv from "dotenv";
dotenv.config();

// connecting db as pool for further use
const pool = new Pool({
  connectionString: process.env.DB_URI,
});
console.log("Connected !")

export default pool
