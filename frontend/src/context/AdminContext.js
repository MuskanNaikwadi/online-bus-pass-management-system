// src/context/AdminContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext();

export function getAdminPhotoUrl(photo) {
  if (!photo) return "";
  return `${process.env.REACT_APP_API_URL}/${photo}`;
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);

  const refreshAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("${process.env.REACT_APP_API_URL}/api/admin/profile", {
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