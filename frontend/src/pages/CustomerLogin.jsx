// src/pages/CustomerLogin.jsx
import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function CustomerLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", account_number: "", password: "" });
  const [msg, setMsg] = useState("");

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Signing in…");
    const { ok, json } = await api.customerFullLogin(form);
    if (ok) {
      nav("/customer");
    } else {
      setMsg(json?.message || "Login failed.");
    }
  }

  return (
    <div className="page">
      <h1>Customer Login</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Full name</label>
        <input name="full_name" value={form.full_name} onChange={onChange} required />

        <label>Account number</label>
        <input name="account_number" value={form.account_number} onChange={onChange} required pattern="^\d{6,20}$" />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} required />

        <button type="submit">Login</button>
        <div className="muted">
          New customer? <Link to="/register">Create an account</Link>
        </div>
      </form>
      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}