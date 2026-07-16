import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ThemeApplier from "./components/ThemeApplier";
import "./pages/DarkTheme.css";
import "./pages/AdminDarkTheme.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyPass from "./pages/ApplyPass";
import MyPasses from "./pages/MyPasses";
import Notifications from "./pages/Notifications";
import WomenSafety from "./pages/WomenSafety";
import PaymentHistory from "./pages/PaymentHistory";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
//AdminSide
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminApprovedPasses from "./pages/AdminApprovedPasses";
import AdminRejectedPasses from "./pages/AdminRejectedPasses";
import AdminSettings from "./pages/AdminSettings";
import VerifyPass from "./pages/VerifyPass";
import EmergencyApplications from "./pages/EmergencyApplications";
import AiChat from "./pages/AiChat";
import "./App.css";
import AdminProfile from "./pages/AdminProfile";

function App() {
  return (
    <ThemeProvider>
      <AdminThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <BrowserRouter>
              {/* ✅ must be inside BrowserRouter to use useLocation */}
              <ThemeApplier />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply-pass" element={<ApplyPass />} />
                <Route path="/my-passes" element={<MyPasses />} />
                <Route path="/women-safety" element={<WomenSafety />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ai-chat" element={<AiChat />} />

                <Route
                  path="/admin-dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-applications"
                  element={
                    <AdminRoute>
                      <AdminApplications />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-approved-passes"
                  element={
                    <AdminRoute>
                      <AdminApprovedPasses />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-rejected-passes"
                  element={
                    <AdminRoute>
                      <AdminRejectedPasses />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-emergencies"
                  element={
                    <AdminRoute>
                      <EmergencyApplications />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-settings"
                  element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-profile"
                  element={
                    <AdminRoute>
                      <AdminProfile />
                    </AdminRoute>
                  }
                />
                <Route path="/verify-pass/:id" element={<VerifyPass />} />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </LanguageProvider>
      </AdminThemeProvider>
    </ThemeProvider>
  );
}

export default App;