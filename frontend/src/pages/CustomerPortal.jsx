// src/pages/CustomerPortal.jsx
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/auth";
import { useState } from "react";
import { api } from "../api"; // assuming you already have API helpers

export default function CustomerPortal() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  return (
    <div style={{maxWidth: 900, margin: "24px auto", color:"#e5e7eb"}}>
      <h2>Customer Portal</h2>
      <p>Welcome! You can capture international payments here.</p>
      {/* add your capture form here later */}
    </div>
  );

  async function onLogout() {
    try {
      // optional: hit backend logout if you added it
      // await api.customerLogout();
    } catch {}
    auth.logoutCust();
    auth.clearExtras();
    nav("/", { replace: true });
  }

  // ... your existing UI for making payments ...
  return (
    <div style={{ maxWidth: 900, margin: "24px auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Customer Portal</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      {msg && <p style={{ background: "#f5f5f5", padding: 8, borderRadius: 6 }}>{msg}</p>}

      {/* your payment form here */}
      {/* ... */}
    </div>
  );
}