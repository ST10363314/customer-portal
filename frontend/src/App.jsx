// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";            
import EmployeeConsole from "./pages/EmployeeConsole";
import CustomerPortal from "./pages/CustomerPortal"; 

// simple auth flags (same as before)
const isEmpAuthed = () => localStorage.getItem("empAuth") === "true";
const isCustAuthed = () => localStorage.getItem("custAuth") === "true";

export default function App() {
  return (
    <Routes>
      {/* Landing: choose role */}
      <Route path="/" element={<Landing />} />

      {/* Employee/Admin */}
      <Route path="/employee/login" element={<Login mode="employee" />} />
      <Route
        path="/console"
        element={isEmpAuthed() ? <EmployeeConsole /> : <Navigate to="/employee/login" replace />}
      />

      {/* Customer */}
      <Route path="/customer/login" element={<Login mode="customer" />} />
      <Route path="/customer/register" element={<Register />} />
      <Route
        path="/customer"
        element={isCustAuthed() ? <CustomerPortal /> : <Navigate to="/customer/login" replace />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}