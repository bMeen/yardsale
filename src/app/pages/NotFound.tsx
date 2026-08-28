import FullPage from "@/components/FullPage";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useNavigate } from "react-router";

function NotFound() {
  const navigate = useNavigate();

  return (
    <FullPage>
      <div className="mx-auto w-full max-w-md space-y-3.5 rounded-lg bg-white p-4 text-center sm:p-8">
        <div className="flex items-center justify-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <FileQuestion className="text-muted-foreground h-8 w-8" />
          </div>
        </div>

        <h1 className="font-display">PAGE NOT FOUND</h1>

        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved, deleted, or the URL might be incorrect.
        </p>

        <Button
          size="lg"
          onClick={() => navigate("/")}
          className="hover:cursor-pointer"
        >
          GO BACK
        </Button>
      </div>
    </FullPage>
  );
}

export default NotFound;
