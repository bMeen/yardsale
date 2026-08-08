import { NAVIGATIONS } from "@/shared/constants";
import Logo from "./Logo";
import { NavLink } from "react-router";
import { Plus } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import UnreadCount from "./UnreadCount";

const unreadCount = 5;

function Sidebar() {
  const sideItems = NAVIGATIONS.filter((i) => i.id !== "create");

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

      <ul className="flex-1 scrollbar-none space-y-1 overflow-y-auto p-4">
        {sideItems.map((item) => {
          return (
            <NavLink to={item.href} className="block" key={item.id}>
              {({ isActive }) => (
                <li
                  className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <item.icon size={17} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.label}
                  {item.id === "activity" && unreadCount > 0 && (
                    <UnreadCount className="bg-primary text-primary-foreground ml-auto" />
                  )}
                </li>
              )}
            </NavLink>
          );
        })}
      </ul>

      <div className="border-border border-t p-4">
        <div className="bg-muted rounded-xl p-3.5">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            Available Balance
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold">
            {" "}
            {formatAmount(1000000)}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
