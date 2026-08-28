import FullPage from "./FullPage";
import { Button } from "./ui/button";
import { type FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <FullPage>
      <div className="mx-auto w-full max-w-md space-y-3.5 rounded-lg bg-white p-4 text-center sm:p-8">
        <h1>Something went wrong</h1>
        <p>{(error as Error)?.message}</p>
        <Button size="lg" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </FullPage>
  );
}

export default ErrorFallback;
