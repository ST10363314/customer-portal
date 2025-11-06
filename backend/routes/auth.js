// backend/routes/auth.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../utils/db");

const router = express.Router();

/* ---------------- Whitelists (strict, human-friendly) ---------------- */
// Examples allowed: "Oaitse Letlojane", "Mary-Jane O'Connor", "J. P. Morgan"
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,58}[A-Za-z]$/;   // 2–60 chars, letters and . ' - space
const ID_RE   = /^[0-9]{13}$/;                            // SA ID: exactly 13 digits
const ACC_RE  = /^[0-9]{10,16}$/;                         // account#: 10–16 digits
// FIXED: lookaheads must be (?=.*x), not (?=.x)
const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;

/* ---------------- Validation wrapper ---------------- */
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: errors.array() });
    }
    next();
  },
];

/* ---------------- POST /api/auth/register (Customer) ---------------- */
router.post(
  "/register",
  validate([
    body("full_name").isString().trim().matches(NAME_RE),
    body("id_number").isString().matches(ID_RE),
    body("account_number").isString().matches(ACC_RE),
    body("password").isString().matches(PASS_RE),
  ]),
  async (req, res) => {
    const { full_name, id_number, account_number, password } = req.body;

    try {
      // Uniqueness on account_number
      const exists = await pool.query(
        "SELECT id FROM customers WHERE account_number = $1",
        [account_number]
      );
      if (exists.rowCount > 0) {
        return res.status(409).json({ message: "Account number already exists" });
      }

      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);

      await pool.query(
        `INSERT INTO customers (full_name, id_number, account_number, password_hash)
         VALUES ($1,$2,$3,$4)`,
        [full_name, id_number, account_number, hash]
      );

      return res.status(201).json({ message: "Registered" });
    } catch (err) {
      console.error("AUTH REGISTER ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ---------------- POST /api/auth/login (Customer) ---------------- */
router.post(
  "/login",
  validate([
    // Frontend sends: username (customer full name) + account_number + password
    body("username")
      .isString()
      .trim()
      .isLength({ min: 2, max: 60 })
      .matches(NAME_RE),
    body("account_number").isString().matches(ACC_RE),
    body("password").isString().isLength({ min: 8 }),
  ]),
  async (req, res) => {
    const { username, account_number, password } = req.body;

    try {
      const q = await pool.query(
        `SELECT id, full_name, account_number, password_hash
           FROM customers
          WHERE full_name = $1 AND account_number = $2`,
        [username, account_number]
      );

      if (q.rowCount === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = q.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash || "");
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const secret = process.env.JWT_SECRET || "dev-secret-change-me";
      if (!process.env.JWT_SECRET) {
        console.warn("[WARN] JWT_SECRET is not set; using dev fallback");
      }

      const token = jwt.sign({ uid: user.id, t: "customer" }, secret, {
        expiresIn: "1h",
      });

      // Cookie for cross-site dev (5173 -> 3443) needs SameSite=None + Secure
      res.cookie("cust_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Logged in" });
    } catch (err) {
      console.error("AUTH LOGIN ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ---------------- POST /api/auth/logout ---------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("cust_token", { path: "/" });
  return res.status(200).json({ message: "Logged out" });
});

/* ---------------- Auth middleware + GET /api/auth/me ---------------- */
function requireCustomer(req, res, next) {
  const token = req.cookies?.cust_token;
  if (!token) return res.status(401).json({ message: "Not logged in" });
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-change-me"
    );
    if (payload?.t !== "customer") {
      return res.status(401).json({ message: "Invalid session" });
    }
    req.user = payload; // { uid, t: 'customer' }
    next();
  } catch (_) {
    return res.status(401).json({ message: "Invalid session" });
  }
}

router.get("/me", requireCustomer, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, full_name, account_number FROM customers WHERE id=$1",
      [req.user.uid]
    );
    if (r.rowCount === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ ok: true, user: r.rows[0] });
  } catch (e) {
    console.error("AUTH ME ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;