import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

function ErrorBoundaryLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleReset = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundaryLayout;
