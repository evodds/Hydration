import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAppState } from '@/state/AppStateContext.tsx';

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAppState();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
