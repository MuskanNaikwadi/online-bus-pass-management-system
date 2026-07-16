import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAdminTheme } from "../context/AdminThemeContext";

// ✅ these routes must NEVER get any dark theme, regardless of saved preference
const PUBLIC_NO_THEME_PATHS = ["/", "/login", "/register"];

function ThemeApplier() {
  const location = useLocation();
  const { darkMode: userDarkMode } = useTheme();
  const { darkMode: adminDarkMode } = useAdminTheme();

  useEffect(() => {
    const path = location.pathname;
    const isPublicPage = PUBLIC_NO_THEME_PATHS.includes(path);
    const isAdminPage = path.startsWith("/admin") || path.startsWith("/verify-pass");

    // always start clean — avoid stacking classes across navigations
    document.body.classList.remove("dark-theme", "admin-dark-theme");

    if (isPublicPage) {
      // Home / Login / Register — always light, no exceptions
      return;
    }

    if (isAdminPage) {
      if (adminDarkMode) {
        document.body.classList.add("admin-dark-theme");
      }
    } else {
      if (userDarkMode) {
        document.body.classList.add("dark-theme");
      }
    }
  }, [location.pathname, userDarkMode, adminDarkMode]);

  return null; // renders nothing — pure side-effect component
}

export default ThemeApplier;