require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

// ROUTES
const authRoutes = require("./routes/auth");
const paymentsRoutes = require("./routes/payment");
const employeeRoutes = require("./routes/employee");  // <— IMPORTANT

const app = express();

/* ------------ Security + parsing ------------ */
app.set("trust proxy", 1);
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(hpp());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* ------------ CORS (allow one or more origins) ------------ */
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://localhost:5174,https://localhost:5173";
const allowed = FRONTEND_ORIGIN.split(",").map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

/* ------------ Rate limit ------------ */
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

/* ------------ CSRF (cookie-based) ------------ */
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: true,      // HTTPS only
    sameSite: "none",  // needed for cross-site dev (https://localhost:5174 -> 3443)
    path: "/",
  }
}));

// Health & CSRF endpoints
app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));
app.get("/api/csrf",   (req, res) => res.status(200).json({ csrfToken: req.csrfToken() }));

/* ------------ Routes ------------ */
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/employee", employeeRoutes);  // <— MOUNTED HERE

/* ------------ Error handlers ------------ */
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed by CORS" });
  }
  next(err);
});

/* ------------ HTTPS server ------------ */
const keyPath  = process.env.SSL_KEY  || path.join(__dirname, "config/ssl/key.pem");
const certPath = process.env.SSL_CERT || path.join(__dirname, "config/ssl/cert.pem");
const credentials = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };

const PORT = process.env.PORT || 3443;
https.createServer(credentials, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});
