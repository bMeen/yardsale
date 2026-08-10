import { NAVIGATIONS } from "@/shared/constants";
import Logo from "./Logo";
import { NavLink } from "react-router";
import { Plus } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import UnreadCount from "./UnreadCount";
import { useWalletAccount } from "@/features/wallet/hooks/useWalletAccount";
import { Skeleton } from "./ui/skeleton";
import Logout from "@/features/auth/components/Logout";

function Sidebar() {
  const sideItems = NAVIGATIONS.filter((i) => i.id !== "create");
  const { isLoading, available } = useWalletAccount();

  return (
    <aside className="bg-card border-border sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r md:flex">
      <div className="border-border flex items-center justify-center gap-2.5 border-b p-4">
        <Logo />
      </div>

      <div className="border-border border-b p-4">
        <NavLink
          to="auctions/create"
          className={({ isActive }) =>
            `flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all ${
              isActive
                ? "bg-primary/90 text-primary-foreground ring-primary/30 ring-2"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`
          }
        >
          <Plus size={17} /> Create Auction
        </NavLink>
      </div>

      <ul className="flex flex-1 scrollbar-none flex-col justify-between space-y-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sideItems.map((item) => {
            return (
              <NavLink to={item.href} className="block" key={item.id}>
                {({ isActive }) => (
                  <li
                    className={`relative flex w-full items-center gap-3 rounded-xl p-4 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <item.icon size={17} strokeWidth={isActive ? 2.5 : 1.5} />
                    {item.label}
                    {item.id === "activity" && <UnreadCount type="sidebar" />}
                  </li>
                )}
              </NavLink>
            );
          })}
        </div>

        <Logout />
      </ul>

      <div className="border-border border-t p-4">
        <div className="bg-muted rounded-xl p-3.5">
          {isLoading ? (
            <>
              <Skeleton className="h-3 w-7" />
              <Skeleton className="h-3 w-16" />
            </>
          ) : (
            available && (
              <>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase md:text-xs">
                  Available Balance
                </p>
                <p className="font-mono text-lg font-bold">
                  {formatAmount(available?.balance)}
                </p>
              </>
            )
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
