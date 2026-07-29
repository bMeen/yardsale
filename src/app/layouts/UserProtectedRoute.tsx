import Loader from "@/components/Loader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

function UserProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, isLoading } = useCurrentUser();
  const isUser = user?.profile.role === "USER";

  useEffect(() => {
    if (!user?.isAuthenticated && !isLoading && !isUser) navigate("/");
  }, [user, isLoading, navigate, isUser]);

  if (isLoading) return <Loader />;

  if (user?.isAuthenticated && isUser) return children;
}

export default UserProtectedRoute;
