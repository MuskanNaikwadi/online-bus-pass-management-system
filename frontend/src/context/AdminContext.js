// src/context/AdminContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext();

export function getAdminPhotoUrl(photo) {
  if (!photo) return "";
  return `http://localhost:5000/${photo}`;
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);

  const refreshAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmin(res.data.data);
    } catch (error) {
      console.log("Admin refresh error:", error);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  return (
    <AdminContext.Provider value={{ admin, setAdmin, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);