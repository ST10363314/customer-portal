// src/api.js
const BASE = "https://localhost:3443";
let csrf = null;

async function j(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { ok: res.ok, json };
}

export const api = {
  async getCsrf() {
    const res = await fetch(`${BASE}/api/csrf`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    csrf = data?.csrfToken || null;
    return csrf;
  },

  // ---- Employee/Admin
  employeeLogin(username, password) {
    return j("POST", "/api/employee/login", { username, password });
  },
  listPayments(status) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return j("GET", `/api/employee/payments${qs}`);
  },
  verifyPayment(id) {
    return j("POST", `/api/employee/verify/${id}`);
  },
  submitAll() {
    return j("POST", `/api/employee/submit`);
  },

  // ---- Customer
  customerLogin(fullName, accountNumber, password) {
    const cleanAcc = (accountNumber || "").replace(/\s+/g, "");
    return j("POST", "/api/auth/login", {
      username: fullName,        // backend uses "username" for full_name
      account_number: cleanAcc,  // 10–16 digits
      password,
    });
  },
  me() {
    return j("GET", "/api/auth/me");
  },
  logout() {
    return j("POST", "/api/auth/logout").catch(()=>{}).finally(()=>{ csrf = null; });
  },
};