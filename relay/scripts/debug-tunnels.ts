import "dotenv/config";
import { Pool } from "pg";
import { auth } from "../src/auth.js";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query("SELECT id, email FROM radon_users LIMIT 1");
  if (!rows[0]) {
    console.log("no users");
    process.exit(0);
  }
  const { token } = auth.createSessionToken(rows[0].id);
  console.log("email", rows[0].email);
  const res = await fetch("http://localhost:4000/api/tunnels", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("status", res.status);
  console.log(await res.text());
  await pool.end();
}

main();
