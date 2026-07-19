import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsAdmin(res.data.role === "admin");
      } catch (error) {
        console.log("AdminRoute check failed:", error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, []);

  if (checking) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking access...
      </div>
    );
  }

  // ✅ if the currently logged-in account is NOT an admin, kick them out
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;