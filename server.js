import express from "express";
import session from "express-session";
import { initDb } from "./initDb.js";

import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import { cartRouter } from "./routes/cart.js";
import { meRouter } from "./routes/me.js";

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());

app.use(
  session({
    secret: process.env.SPIRAL_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

app.use(express.static("public"));

// routes
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/auth/me", meRouter);

// START SERVER ONLY AFTER DB INIT
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
  });
