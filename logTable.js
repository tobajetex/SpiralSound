import { pool } from "./db/db.js";

async function logTable() {
  const tableName = "cart_items";
  // const tableName = "products";
  // const tableName = "users";

  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    console.table(result.rows);
  } catch (err) {
    console.error("Error fetching table:", err.message);
  }
}

logTable();