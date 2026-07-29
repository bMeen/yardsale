import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Loader2, LogOut, Wallet } from "lucide-react";

function Header() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { isPending, logout } = useLogout();
  const { user } = useCurrentUser();

  return (
    <div className="bg-background/95 border-border sticky top-0 z-20 border-b px-2 py-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">{greeting}</p>
          <p className="font-display text-xl leading-tight font-bold">
            {user?.profile.full_name}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
            <Wallet size={13} />
            <span className="font-mono text-xs font-semibold md:text-sm">
              1,000,000
            </span>
          </div>

          <UserAvatar
            url={user?.profile.avatar_url || ""}
            fallback={user?.profile.full_name[0]}
          />
          <Button
            onClick={() => logout()}
            type="button"
            variant="ghost"
            className="hover:cursour-pointer"
          >
            {isPending ? <Loader2 /> : <LogOut />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
