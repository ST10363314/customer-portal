// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{marginBottom:16}}>Welcome</h1>
        <p style={{opacity:.85, marginBottom:24}}>
          Choose how you’d like to continue.
        </p>

        <div style={{display:"grid", gap:12, width:"100%", maxWidth:360}}>
          <button style={primaryBtn} onClick={()=>nav("/customer/login")}>
            I am a Customer
          </button>
          <button style={ghostBtn} onClick={()=>nav("/employee/login")}>
            I am an Employee / Admin
          </button>
        </div>

        <p style={{marginTop:20, fontSize:12, opacity:.6}}>
          Secure over HTTPS • CSRF protected • Input whitelisting enabled
        </p>
      </div>
    </div>
  );
}

const wrap = {
  minHeight:"100dvh",
  display:"grid",
  placeItems:"center",
  background:"#0f172a", // slate-900
  color:"#e5e7eb"
};
const card = {
  background:"#111827", // gray-900
  border:"1px solid #1f2937",
  padding:"32px 28px",
  width:"min(92vw, 520px)",
  borderRadius:16,
  boxShadow:"0 10px 30px rgba(0,0,0,.35)",
  textAlign:"center"
};
const primaryBtn = {
  padding:"12px 16px",
  background:"#22c55e",
  color:"#0b1410",
  border:"none",
  borderRadius:10,
  fontWeight:700,
  cursor:"pointer"
};
const ghostBtn = {
  padding:"12px 16px",
  background:"transparent",
  color:"#e5e7eb",
  border:"1px solid #334155",
  borderRadius:10,
  fontWeight:700,
  cursor:"pointer"
};