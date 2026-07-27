import UserAvatar from "@/components/UserAvatar";
import { Wallet } from "lucide-react";

function Header() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="bg-background/95 border-border sticky top-0 z-20 border-b px-2 py-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">{greeting}</p>
          <p className="font-display text-xl leading-tight font-bold">
            Al-Ameen
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
            <Wallet size={13} />
            <span className="font-mono text-xs font-semibold md:text-sm">
              1,000,000
            </span>
          </div>

          <UserAvatar url="https://github.com/shadcn.png" />
        </div>
      </div>
    </div>
  );
}

export default Header;
