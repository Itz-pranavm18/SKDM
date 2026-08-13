import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner"></div>
        <p>Verifying admin permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
