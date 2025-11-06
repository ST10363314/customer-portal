// C:\Projects\customer-portal\backend\routes\employee.js
const express = require("express");
const { body, query, validationResult } = require("express-validator");
const pool = require("../utils/db");
const bcrypt = require("bcryptjs");

const router = express.Router();

/**
 * SUPER SIMPLE “SESSION”
 * We piggy-back on the CSRF cookie per tab as a poor-man’s session key.
 * (Good enough for this assignment demo; not for production.)
 */
const sessions = new Map(); // key: string -> { userId, role }
function getSessionKey(req) {
  return (req.cookies && req.cookies._csrf) || req.ip;
}

// REGEX whitelist: letters, digits, dot, underscore; 3–32 chars
const USERNAME_RE = /^[a-zA-Z0-9._]{3,32}$/;

/* ========== POST /api/employee/login ========== */
router.post(
  "/login",
  body("username").isString().trim().matches(USERNAME_RE),
  body("password").isString().isLength({ min: 8, max: 128 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const { rows } = await pool.query(
        `SELECT id, username, email, role, password_hash
           FROM employees
          WHERE username = $1`,
        [username]
      );
      if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

      const emp = rows[0];
      const ok = await bcrypt.compare(password, emp.password_hash || "");
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const key = getSessionKey(req);
      sessions.set(key, { userId: emp.id, role: emp.role });

      return res.status(200).json({ message: "Logged in", role: emp.role });
    } catch (err) {
      console.error("EMP LOGIN ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ========== auth guard (demo) ========== */
router.use((req, res, next) => {
  const key = getSessionKey(req);
  const sess = sessions.get(key);
  if (!sess) return res.status(401).json({ message: "Not authenticated" });
  req.emp = sess;
  next();
});

/* ========== GET /api/employee/me (optional sanity) ========== */
router.get("/me", (req, res) => {
  res.json({ ok: true, role: req.emp.role, userId: req.emp.userId });
});

/* ========== GET /api/employee/payments?status=pending|verified|submitted ========== */
router.get(
  "/payments",
  query("status").optional().isIn(["pending", "verified", "submitted"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input", errors: errors.array() });
    }

    // Normalize to UPPER for DB compare; allow null (means “all”)
    const statusParam = req.query.status ? String(req.query.status).toUpperCase() : null;

    try {
      const { rows } = await pool.query(
        `SELECT t.id,
                COALESCE(c.full_name, '(unknown)') AS customer,
                t.amount, t.currency, t.provider, t.status
           FROM transactions t
           LEFT JOIN customers c ON c.id = t.customer_id
          WHERE ($1::text IS NULL OR t.status = $1)
          ORDER BY t.id DESC`,
        [statusParam]
      );
      return res.json(rows);
    } catch (err) {
      console.error("EMP LIST PAYMENTS ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ========== POST /api/employee/verify/:id ========== */
router.post("/verify/:id", async (req, res) => {
  if (req.emp.role !== "employee" && req.emp.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const id = Number(req.params.id) || 0;

  try {
    const { rowCount } = await pool.query(
      `UPDATE transactions
          SET status = 'VERIFIED'
        WHERE id = $1 AND status = 'PENDING'`,
      [id]
    );
    if (rowCount === 0) return res.status(400).json({ message: "Nothing to verify" });
    return res.json({ message: "Marked as verified", id });
  } catch (err) {
    console.error("EMP VERIFY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ========== POST /api/employee/submit ========== */
router.post("/submit", async (req, res) => {
  if (req.emp.role !== "admin") return res.status(403).json({ message: "Admin only" });

  try {
    const { rowCount } = await pool.query(
      `UPDATE transactions
          SET status = 'SUBMITTED'
        WHERE status = 'VERIFIED'`
    );
    return res.json({ message: "Submitted verified items", count: rowCount });
  } catch (err) {
    console.error("EMP SUBMIT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
// --- POST /api/employee/logout ---
router.post("/logout", (req, res) => {
  const key = (req.cookies && req.cookies._csrf) || req.ip;
  sessions.delete(key);
  res.clearCookie("_csrf");
  return res.json({ message: "Logged out" });
});

module.exports = router;