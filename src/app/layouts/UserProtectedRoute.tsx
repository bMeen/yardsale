import Loader from "@/components/Loader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { Role } from "@/features/identity/types";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

function UserProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: Role;
}) {
  const navigate = useNavigate();
  const { user, isLoading } = useCurrentUser();
  const isAuthenticated = user?.isAuthenticated;
  const hasRequiredRole = user?.profile.role === role;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRequiredRole)) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, navigate]);

  if (isLoading) return <Loader />;

  if (!isAuthenticated || !hasRequiredRole) {
    return null;
  }

  return children;
}

export default UserProtectedRoute;
