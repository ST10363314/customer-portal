// src/pages/EmployeeConsole.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function EmployeeConsole() {
  const nav = useNavigate();
  const [status, setStatus] = useState("pendingz");
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("Loading…");
    const { ok, json } = await api.listPayments(status);
    if (ok) {
      setRows(json || []); // backend returns an array
      setMsg(`Loaded ${json?.length || 0} record(s).`);
    } else {
      setRows([]);
      setMsg(json?.message || "Server error");
    }
  }

  useEffect(() => {
    api.getCsrf().then(load).catch(()=>setMsg("Failed to init CSRF."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function verify(id) {
    const { ok, json } = await api.verifyPayment(id);
    setMsg(json?.message || (ok ? "Verified." : "Verify failed."));
    if (ok) load();
  }

  async function submitAll() {
    const { ok, json } = await api.submitAll();
    setMsg(json?.message || (ok ? "Submitted." : "Submit failed."));
    if (ok) { setStatus("submitted"); load(); }
  }

  async function onLogout() {
    await api.logout();   // best-effort; clears cookie if backend supports
    nav("/employee/login");
  }

  return (
    <div style={page}>
      <div style={topbar}>
        <h1 style={{margin:0}}>Employee Payments Console</h1>
        <button onClick={onLogout} style={logoutBtn}>Logout</button>
      </div>

      <div style={{margin:"12px 0"}}>
        <label> Status filter: </label>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={select}>
          <option value="pending">pending</option>
          <option value="verified">verified</option>
          <option value="submitted">submitted</option>
        </select>

        {status === "verified" && (
          <button onClick={submitAll} style={primaryBtn}>
            Submit All Verified → Submitted
          </button>
        )}
      </div>

      {msg && <div style={msgBox}>{msg}</div>}

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.customer || r.full_name || "-"}</td>
                <td>{Number(r.amount).toFixed(2)}</td>
                <td>{r.currency}</td>
                <td>{r.provider}</td>
                <td>{r.status}</td>
                <td>
                  {String(r.status).toLowerCase() === "pending" && (
                    <button onClick={() => verify(r.id)} style={miniBtn}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="7" style={{textAlign:"center", opacity:.7}}>No records.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const page = { maxWidth:980, margin:"32px auto", color:"#e5e7eb", fontFamily:"system-ui" };
const topbar = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 };
const logoutBtn = { padding:"10px 14px", borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e5e7eb", cursor:"pointer" };
const select = { marginLeft:8, padding:"6px 8px", borderRadius:6, border:"1px solid #334155", background:"#0b1220", color:"#e5e7eb" };
const primaryBtn = { marginLeft:12, padding:"8px 12px", borderRadius:8, border:"none", background:"#22c55e", color:"#0b1410", fontWeight:700, cursor:"pointer" };
const msgBox = { marginTop:8, padding:"10px 12px", borderRadius:8, border:"1px solid #1f2937", background:"#0b1220" };
const tableWrap = { marginTop:12, border:"1px solid #1f2937", borderRadius:10, overflow:"hidden" };
const table = {
  width:"100%",
  borderCollapse:"separate",
  borderSpacing:0,
  background:"#0b1220",
};
const miniBtn = { padding:"6px 10px", borderRadius:6, border:"1px solid #334155", background:"#0f172a", color:"#e5e7eb", cursor:"pointer" };