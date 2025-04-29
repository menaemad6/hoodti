
import { useAuth, UserRole } from "@/context/AuthContext";

export function useRoleAccess() {
  const { userRole, isAuthenticated } = useAuth();
  
  const hasAccess = (requiredRole: UserRole | UserRole[]) => {
    if (!isAuthenticated || !userRole) return false;
    
    // Role hierarchy: super_admin > admin > user
    const roleWeight = {
      "super_admin": 3,
      "admin": 2,
      "user": 1
    };
    
    const userRoleWeight = roleWeight[userRole];
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => roleWeight[role] <= userRoleWeight);
    }
    
    return roleWeight[requiredRole] <= userRoleWeight;
  };
  
  const isAdmin = isAuthenticated && (userRole === "admin" || userRole === "super_admin");
  const isSuperAdmin = isAuthenticated && userRole === "super_admin";
  const isUser = isAuthenticated && userRole === "user";
  
  return {
    hasAccess,
    isAdmin,
    isSuperAdmin,
    isUser,
    userRole,
  };
}
