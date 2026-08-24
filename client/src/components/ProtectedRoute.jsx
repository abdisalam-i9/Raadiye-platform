import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { t } = useI18n();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label={t.common.checking} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
