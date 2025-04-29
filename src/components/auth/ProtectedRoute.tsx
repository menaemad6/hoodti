import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useRoleAccess } from "@/hooks/use-role-access";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole = "user" 
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const { hasAccess } = useRoleAccess();
  const location = useLocation();

  // Show loading state while checking authentication and role
  if (isLoading || (isAuthenticated && !userRole)) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  // Wait for role to be loaded before checking access
  if (!userRole) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check role access
  if (!hasAccess(requiredRole)) {
    // Redirect to home if authenticated but doesn't have the required role
    return <Navigate to="/" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
