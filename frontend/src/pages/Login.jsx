// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login({ mode = "employee" }) {
  const nav = useNavigate();

  // For employees: username + password
  // For customers: fullName + accountNumber + password
  const [username, setUsername] = useState("");         // employee full username
  const [fullName, setFullName] = useState("");         // customer full name
  const [accountNumber, setAccountNumber] = useState(""); // customer account number
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.getCsrf().catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("Signing in…");

    let res;
    if (mode === "employee") {
      res = await api.employeeLogin(username, password);
    } else {
      res = await api.customerLogin(fullName, accountNumber, password);
    }

    if (res.ok) {
      setMsg("Signed in.");
      if (mode === "employee") nav("/console");
      else nav("/customer"); // or wherever your customer home is
    } else {
      setMsg(res.json?.message || "Login failed.");
    }
    setBusy(false);
  }

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={form}>
        <h2 style={{marginBottom:18}}>
          {mode === "employee" ? "Employee/Admin Login" : "Customer Login"}
        </h2>

        {mode === "employee" ? (
          <>
            <label style={label}>Username</label>
            <input
              style={input}
              value={username}
              onChange={e=>setUsername(e.target.value)}
              placeholder="e.g. thabo.clerk"
              autoFocus
            />
          </>
        ) : (
          <>
            <label style={label}>Full name</label>
            <input
              style={input}
              value={fullName}
              onChange={e=>setFullName(e.target.value)}
              placeholder="e.g. Mike Tyson"
              autoFocus
            />

            <label style={label}>Account number</label>
            <input
              style={input}
              value={accountNumber}
              onChange={e=>setAccountNumber(e.target.value)}
              placeholder="10–16 digits (no spaces)"
              inputMode="numeric"
            />
          </>
        )}

        <label style={label}>Password</label>
        <input
          style={input}
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button style={primaryBtn} disabled={busy}>
          {busy ? "Please wait…" : "Login"}
        </button>

        {msg && <div style={msgBox}>{msg}</div>}

        <button
          type="button"
          onClick={()=>nav("/")}
          style={{...ghostBtn, marginTop:10}}
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

const wrap = {
  minHeight:"100dvh",
  display:"grid",
  placeItems:"center",
  background:"#0f172a",
  color:"#e5e7eb",
};
const form = {
  width:"min(92vw, 420px)",
  padding:"26px 22px",
  borderRadius:14,
  border:"1px solid #1f2937",
  background:"#111827",
  display:"grid",
  gap:10,
};
const label = { fontSize:12, opacity:.8 };
const input = {
  padding:"10px 12px",
  borderRadius:10,
  border:"1px solid #334155",
  background:"#0b1220",
  color:"#e5e7eb"
};
const primaryBtn = {
  marginTop:8,
  padding:"12px 16px",
  background:"#22c55e",
  color:"#0b1410",
  border:"none",
  borderRadius:10,
  fontWeight:700,
  cursor:"pointer"
};
const ghostBtn = {
  padding:"10px 14px",
  background:"transparent",
  color:"#e5e7eb",
  border:"1px solid #334155",
  borderRadius:10,
  fontWeight:600,
  cursor:"pointer"
};
const msgBox = {
  marginTop:8,
  fontSize:13,
  background:"#0b1220",
  border:"1px solid #1f2937",
  padding:"10px 12px",
  borderRadius:8
};