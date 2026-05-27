import { pool } from "../db/db.js";

export async function addToCart(req, res) {
  const productId = parseInt(req.body.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const userId = req.session.userId;

  try {
    const existing = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId],
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1",
        [existing.rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, 1)`,
        [userId, productId],
      );
    }

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    res.status(500).json({ error: "Failed to add to cart" });
  }
}

export async function getCartCount(req, res) {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS totalitems
       FROM cart_items
       WHERE user_id = $1`,
      [req.session.userId],
    );

    res.json({ totalItems: Number(result.rows[0].totalitems) });
  } catch (err) {
    console.error("Cart count error:", err.message);
    res.status(500).json({ error: "Failed to get cart count" });
  }
}

export async function getAll(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        ci.id AS cartitemid,
        ci.quantity,
        p.title,
        p.artist,
        p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.session.userId],
    );

    res.json({ items: result.rows });
  } catch (err) {
    console.error("Get cart error:", err.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
}

export async function deleteItem(req, res) {
  const itemId = parseInt(req.params.itemId, 10);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  try {
    const item = await pool.query(
      "SELECT quantity FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, req.session.userId],
    );

    if (item.rows.length === 0) {
      return res.status(400).json({ error: "Item not found" });
    }

    await pool.query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [
      itemId,
      req.session.userId,
    ]);

    res.status(204).send();
  } catch (err) {
    console.error("Delete item error:", err.message);
    res.status(500).json({ error: "Failed to delete item" });
  }
}

export async function deleteAll(req, res) {
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [
      req.session.userId,
    ]);

    res.status(204).send();
  } catch (err) {
    console.error("Delete all cart error:", err.message);
    res.status(500).json({ error: "Failed to clear cart" });
  }
}
