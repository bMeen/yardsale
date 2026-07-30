import { NAVIGATIONS } from "@/shared/constants";
import { Plus } from "lucide-react";
import { NavLink } from "react-router";

const unreadCount = 5;

function BottomNav() {
  return (
    <nav className="bg-card/95 border-border fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-md md:hidden">
      <ul className="flex h-16 items-center justify-around px-2">
        {NAVIGATIONS.map((item) => {
          if (item.id === "create")
            return (
              <NavLink to={item.href} key={item.id}>
                {({ isActive }) => (
                  <li
                    key="create"
                    className={`relative -top-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-95 ${isActive ? "bg-primary/90 ring-primary/20 ring-4" : "bg-primary hover:bg-primary/90"}`}
                  >
                    <Plus size={26} className="text-primary-foreground" />
                  </li>
                )}
              </NavLink>
            );
          return (
            <NavLink to={item.href} key={item.id}>
              {({ isActive }) => (
                <li
                  className={`relative flex flex-col items-center gap-0.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />

                  {item.id === "activity" && unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                      {unreadCount}
                    </span>
                  )}

                  {item.label && (
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  )}
                </li>
              )}
            </NavLink>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
