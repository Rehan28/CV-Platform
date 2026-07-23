import { Navigate } from "react-router-dom";
import { useAuth, Role } from "../../context/AuthContext";

export function ProtectedRoute({ children, role }: { children: JSX.Element; role?: Role }) {
  const { user, loading, hasRole } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;
  return children;
}
