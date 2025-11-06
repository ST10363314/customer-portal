const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_me_for_prod";
const JWT_COOKIE_NAME = "emp_jwt";

function signEmployee(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

function employeeAuth(requiredRole = null) {
  return (req, res, next) => {
    try {
      const token = req.cookies[JWT_COOKIE_NAME];
      if (!token) return res.status(401).json({ message: "Not authenticated" });
      const data = jwt.verify(token, JWT_SECRET);
      req.emp = data; // { id, username, role }
      if (requiredRole && data.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Invalid session" });
    }
  };
}

function setEmployeeCookie(res, payload) {
  const token = signEmployee(payload);
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 2
  });
}

function clearEmployeeCookie(res) {
  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true, secure: true, sameSite: "none", path: "/"
  });
}

module.exports = { employeeAuth, setEmployeeCookie, clearEmployeeCookie };