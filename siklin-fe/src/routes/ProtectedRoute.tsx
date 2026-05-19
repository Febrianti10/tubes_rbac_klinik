import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

const ProtectedRoute = ({
  allowedRoles,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roleAllowed =
    !allowedRoles || allowedRoles.length === 0 || allowedRoles.some(hasRole);
  const permissionAllowed =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    requiredPermissions.every(hasPermission);

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to="/forbidden" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
