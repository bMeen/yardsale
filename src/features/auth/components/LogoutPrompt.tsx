import { Button } from "@/components/ui/button";
import { Loader2, UserRoundArrowLeft } from "lucide-react";
import { useLogout } from "../hooks/useLogout";
import { useModal } from "@/components/custom-modal/context";

function LogoutPrompt() {
  const { close } = useModal();
  const { isPending, logout } = useLogout();

  function handleLogout() {
    logout();
    close();
  }

  return (
    <section className="space-y-4 p-4 md:p-0">
      <div
        className={`bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-2xl`}
      >
        <UserRoundArrowLeft size={22} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold">Logout?</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Are you sure you want to logout of your account
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="h-11 flex-1 cursor-pointer"
          onClick={close}
        >
          Close
        </Button>

        <Button
          variant="destructive"
          className="h-11 flex-1 cursor-pointer"
          onClick={handleLogout}
        >
          {isPending && <Loader2 className="animate-spin" />}
          Logout
        </Button>
      </div>
    </section>
  );
}

export default LogoutPrompt;
