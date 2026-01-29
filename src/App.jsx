// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./component/Authentication/Auth";
import ProtectedRoute from "./component/Shared/ProtectedRoute";

// 🔹 Layout Components
import Navbar from "./component/Layout/Navbar";
import Sidebar from "./component/Layout/Sidebar";

// 🔹 Page Components
import LandingPage from "./component/pages/LandingPage";
import DashboardPage from "./component/pages/DashboardPage";
import Login from "./component/Authentication/Login";
import ProjectDetailPage from "./component/Dashboard/ProjectDetails";
import AssignTaskPage from "./component/pages/AssignTaskPage";
import Team from "./component/pages/Team";
import DailyReportPage from "./component/pages/DailyReportPage";
import LeaveCalenderPage from "./component/pages/LeaveCalenderPage";
import ChatPage from "./component/pages/ChatPage";
import Payslip from "./component/Payslip";

function AppLayout() {
  const location = useLocation();

  // Hide Navbar & Sidebar on login page
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="">
      {!isLoginPage && <Navbar />}

      <div className="flex">
        {!isLoginPage && <Sidebar />}

        <div
          className={`flex-1 transition-all duration-300 ${
            isLoginPage ? "ml-0" : "sm:ml-64"
          } p-0`}
        >
          <Routes>
           
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

           
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }

            />

            <Route
              path="/assign-task"
              element={
                <ProtectedRoute>
                  <AssignTaskPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <DailyReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <LeaveCalenderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payslip"
              element={
                <ProtectedRoute>
                  <Payslip />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
