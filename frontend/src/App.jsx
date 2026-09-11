import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenAuth from "./pages/CitizenAuth";
import RoleAuth from "./pages/RoleAuth";
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
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProjectPage from "./pages/student/StudentProjectPage";
import UniversityDashboard from "./pages/university/UniversityDashboard";
import UniversityProjectPage from "./pages/university/UniversityProjectPage";
import IndustryDashboard from "./pages/industry/IndustryDashboard";
import RoleLayout from "./components/role/RoleLayout";
import { ToastProvider } from "./context/ToastContext";
import {
  IndustryCapabilitiesPage,
  IndustryContributionsPage,
  IndustryInvitationsPage,
  IndustryNotificationsPage,
  IndustryOpportunitiesPage,
  IndustryProfilePage,
  StudentNotificationsPage,
  StudentProfilePage,
  StudentProjectsPage,
  StudentSolutionsPage,
  StudentTeamsPage,
  UniversityCapabilitiesPage,
  UniversityInvitationsPage,
  UniversityNotificationsPage,
  UniversityOpportunitiesPage,
  UniversityProfilePage,
  UniversityProjectsPage,
  UniversitySolutionsPage,
} from "./pages/workspace/WorkspacePages";
function App() {
  return (
    <ToastProvider>
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
        <Route
          path="/login/industry"
          element={<RoleAuth role="industry" />}
        />

        <Route element={<ProtectedRoute role="CITIZEN" />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/report-problem" element={<ReportProblemPage />} />
          <Route path="/citizen/my-problems" element={<MyProblemsPage />} />
          <Route path="/citizen/problems/:reportId" element={<ProblemDetailsPage />} />
          <Route path="/citizen/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/dashboard" element={<RoleLayout role="student" title="Dashboard"><StudentDashboard /></RoleLayout>} />
          <Route path="/student/projects" element={<StudentProjectsPage />} />
          <Route path="/student/teams" element={<StudentTeamsPage />} />
          <Route path="/student/solutions" element={<StudentSolutionsPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/projects/:projectId" element={<RoleLayout role="student" title="Project details"><StudentProjectPage /></RoleLayout>} />
        </Route>
        <Route element={<ProtectedRoute role="UNIVERSITY" />}>
          <Route path="/university/dashboard" element={<RoleLayout role="university" title="Dashboard"><UniversityDashboard /></RoleLayout>} />
          <Route path="/university/invitations" element={<UniversityInvitationsPage />} />
          <Route path="/university/opportunities" element={<UniversityOpportunitiesPage />} />
          <Route path="/university/projects" element={<UniversityProjectsPage />} />
          <Route path="/university/solutions" element={<UniversitySolutionsPage />} />
          <Route path="/university/capabilities" element={<UniversityCapabilitiesPage />} />
          <Route path="/university/profile" element={<UniversityProfilePage />} />
          <Route path="/university/notifications" element={<UniversityNotificationsPage />} />
          <Route path="/university/projects/:projectId" element={<RoleLayout role="university" title="Project details"><UniversityProjectPage /></RoleLayout>} />
        </Route>
        <Route element={<ProtectedRoute role="INDUSTRY" />}>
          <Route path="/industry/dashboard" element={<RoleLayout role="industry" title="Dashboard"><IndustryDashboard /></RoleLayout>} />
          <Route path="/industry/invitations" element={<IndustryInvitationsPage />} />
          <Route path="/industry/opportunities" element={<IndustryOpportunitiesPage />} />
          <Route path="/industry/contributions" element={<IndustryContributionsPage />} />
          <Route path="/industry/capabilities" element={<IndustryCapabilitiesPage />} />
          <Route path="/industry/profile" element={<IndustryProfilePage />} />
          <Route path="/industry/notifications" element={<IndustryNotificationsPage />} />
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
    </ToastProvider>
  );
}

export default App;