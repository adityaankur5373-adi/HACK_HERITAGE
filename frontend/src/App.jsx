import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenAuth from "./pages/CitizenAuth";
import RoleAuth from "./pages/RoleAuth";
import Dashboard from "./pages/Dashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportProblemPage from "./pages/ReportProblemPage";
import MyProblemsPage from "./pages/MyProblemsPage";
import ProblemDetailsPage from "./pages/ProblemDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import GovernmentReportsPage from "./pages/GovernmentReportsPage";
import GovernmentReportDetailsPage from "./pages/GovernmentReportDetailsPage";
import GovernmentInfoPage from "./pages/GovernmentInfoPage";
import GovernmentNotificationsPage from "./pages/GovernmentNotificationsPage";
import GovernmentAnalyticsPage from "./pages/GovernmentAnalyticsPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login / Choose Role Page */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/login/citizen"
          element={<CitizenAuth />}
        />

        <Route
          path="/login/student"
          element={<RoleAuth role="student" />}
        />
        <Route
          path="/login/university"
          element={<RoleAuth role="university" />}
        />
        <Route
          path="/login/government"
          element={<RoleAuth role="government" />}
        />

        <Route element={<ProtectedRoute role="CITIZEN" />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/report-problem" element={<ReportProblemPage />} />
          <Route path="/citizen/my-problems" element={<MyProblemsPage />} />
          <Route path="/citizen/problems/:reportId" element={<ProblemDetailsPage />} />
          <Route path="/citizen/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="UNIVERSITY" />}>
          <Route path="/university/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="GOVERNMENT" />}>
          <Route path="/government/dashboard" element={<GovernmentDashboard />} />
          <Route path="/government/reports" element={<GovernmentReportsPage />} />
          <Route path="/government/reports/:reportId" element={<GovernmentReportDetailsPage />} />
          <Route path="/government/notifications"  element={<GovernmentNotificationsPage />}/>
          <Route path="/government/profile" element={<GovernmentInfoPage mode="profile" />} />
          <Route
  path="/government/analytics"
  element={<GovernmentAnalyticsPage />}
/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;