// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [full_name, setFullName] = useState("");
  const [id_number, setIdNumber] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();                    // ← prevents the accidental redirect
    setMsg("Creating account…");
    setBusy(true);

    if (password !== confirm) {
      setMsg("Passwords do not match.");
      setBusy(false);
      return;
    }

    const { ok, json } = await api.customerRegister({
      full_name,
      id_number,
      account_number,
      password,
    });

    if (ok) {
      setMsg("Registered. Please sign in.");
      // Go to customer login (DO NOT go to Landing)
      setTimeout(() => nav("/customer/login"), 400);
    } else {
      setMsg(json?.message || "Registration failed.");
    }
    setBusy(false);
  }

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={form}>
        <h2 style={{marginBottom:18}}>Customer Registration</h2>

        <label style={label}>Full name</label>
        <input style={input} value={full_name} onChange={e=>setFullName(e.target.value)} required />

        <label style={label}>ID number</label>
        <input style={input} value={id_number} onChange={e=>setIdNumber(e.target.value)} required />

        <label style={label}>Account number</label>
        <input style={input} value={account_number} onChange={e=>setAccountNumber(e.target.value)} required />

        <label style={label}>Password</label>
        <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        <label style={label}>Confirm password</label>
        <input style={input} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />

        <button style={primaryBtn} disabled={busy}>{busy ? "Please wait…" : "Create account"}</button>

        {msg && <div style={msgBox}>{msg}</div>}

        <div style={{marginTop:8, fontSize:13}}>
          Already have an account? <Link to="/customer/login">Sign in</Link>
        </div>

        <button type="button" onClick={()=>nav("/")} style={{...ghostBtn, marginTop:10}}>← Back</button>
      </form>
    </div>
  );
}

const wrap = { minHeight:"100dvh", display:"grid", placeItems:"center", background:"#0f172a", color:"#e5e7eb" };
const form = { width:"min(92vw, 420px)", padding:"26px 22px", borderRadius:14, border:"1px solid #1f2937", background:"#111827", display:"grid", gap:10 };
const label = { fontSize:12, opacity:.8 };
const input = { padding:"10px 12px", borderRadius:10, border:"1px solid #334155", background:"#0b1220", color:"#e5e7eb" };
const primaryBtn = { marginTop:8, padding:"12px 16px", background:"#22c55e", color:"#0b1410", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer" };
const ghostBtn = { padding:"10px 14px", background:"transparent", color:"#e5e7eb", border:"1px solid #334155", borderRadius:10, fontWeight:600, cursor:"pointer" };
const msgBox = { marginTop:8, fontSize:13, background:"#0b1220", border:"1px solid #1f2937", padding:"10px 12px", borderRadius:8 };