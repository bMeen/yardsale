import Loader from "@/components/Loader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { Role } from "@/features/identity/types";
import { type ReactNode } from "react";
import { Navigate } from "react-router";

function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: Role;
}): ReactNode {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user.profile.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
