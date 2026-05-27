import { pool } from "../db/db.js";

export async function getGenres(req, res) {
  try {
    const result = await pool.query("SELECT DISTINCT genre FROM products");

    const genres = result.rows.map((row) => row.genre);

    res.json(genres);
  } catch (err) {
    console.error("getGenres error:", err.message);
    res.status(500).json({
      error: "Failed to fetch genres",
      details: err.message,
    });
  }
}

export async function getProducts(req, res) {
  try {
    let query = "SELECT * FROM products";
    const params = [];

    const { genre, search } = req.query;

    if (genre) {
      query += " WHERE genre = $1";
      params.push(genre);
    } else if (search) {
      const searchPattern = `%${search}%`;

      query += `
        WHERE title ILIKE $1
        OR artist ILIKE $1
        OR genre ILIKE $1
      `;

      params.push(searchPattern);
    }

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("getProducts error:", err.message);
    res.status(500).json({
      error: "Failed to fetch products",
      details: err.message,
    });
  }
}
