// src/lib/auth.js
export const auth = {
  // check stored flags
  isEmp()  { return localStorage.getItem("empAuth")  === "true"; },
  isCust() { return localStorage.getItem("custAuth") === "true"; },

  // mark logged in
  loginEmp()  { 
    localStorage.setItem("empAuth", "true"); 
    window.dispatchEvent(new Event("auth-changed"));
  },
  loginCust() { 
    localStorage.setItem("custAuth", "true"); 
    window.dispatchEvent(new Event("auth-changed"));
  },

  // logout + notify
  logoutEmp()  { 
    localStorage.removeItem("empAuth"); 
    window.dispatchEvent(new Event("auth-changed"));
  },
  logoutCust() { 
    localStorage.removeItem("custAuth"); 
    window.dispatchEvent(new Event("auth-changed"));
  },

  // optional helper to clear metadata
  clearExtras() {
    ["empName","custName","custId","empId"].forEach(k =>
      localStorage.removeItem(k)
    );
  }
};