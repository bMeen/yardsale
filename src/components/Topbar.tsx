import { ADMIN_NAVIGATIONS } from "@/shared/constants";
import Logo from "./Logo";
import { NavLink } from "react-router";
import { Loader2, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/useLogout";

function Topbar() {
  const { isPending, logout } = useLogout();

  return (
    <header className="border-border bg-background flex shrink-0 items-center gap-4 border-b p-5">
      <div className="mr-2 flex shrink-0 items-center gap-2.5">
        <Logo />
      </div>

      <ul className="flex flex-1 items-center justify-center gap-4">
        {ADMIN_NAVIGATIONS.map((item) => {
          return (
            <NavLink to={item.href} key={item.id} end>
              {({ isActive }) => (
                <li
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon size={13} />
                  {item.label}
                </li>
              )}
            </NavLink>
          );
        })}
      </ul>

      <div className="ml-2 flex shrink-0 items-center gap-3">
        <button
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors hover:cursor-pointer"
          onClick={() => logout()}
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <LogOut size={14} />
          )}
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
