import { pool } from "../db/db.js";

export async function getCurrentUser(req, res) {
  try {
    if (!req.session.userId) {
      return res.json({ isLoggedIn: false });
    }

    const result = await pool.query("SELECT name FROM users WHERE id = $1", [
      req.session.userId,
    ]);

    if (result.rows.length === 0) {
      return res.json({ isLoggedIn: false });
    }

    const user = result.rows[0];

    res.json({
      isLoggedIn: true,
      name: user.name,
    });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
