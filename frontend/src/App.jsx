import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenAuth from "./pages/CitizenAuth";
import RoleAuth from "./pages/RoleAuth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
          <Route path="/citizen/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="UNIVERSITY" />}>
          <Route path="/university/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="GOVERNMENT" />}>
          <Route path="/government/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;