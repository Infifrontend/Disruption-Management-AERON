
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, User } from '../services/authService';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string;
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { setCurrentUser } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const currentUser = authService.getUser();
      
      if (currentUser && authService.isAuthenticated()) {
        // Verify token with server
        const verifiedUser = await authService.verifyToken();
        if (verifiedUser) {
          setUser(verifiedUser);
          setCurrentUser(verifiedUser);
        }
      }
      
      setIsLoading(false);
    };

    verifyAuth();
  }, [setCurrentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mx-auto mb-4"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type permissions
  if (requiredUserType && !authService.hasPermission(requiredUserType)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required: {requiredUserType} | Your role: {user.userType}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
