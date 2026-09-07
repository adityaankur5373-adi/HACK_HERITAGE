import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function ProtectedRoute({ role }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
