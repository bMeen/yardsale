import { ACTIVITYNAVIGATIONS } from "@/shared/constants";
import { NavLink } from "react-router";
import { Button } from "./ui/button";

function ActivityNavigations() {
  return (
    <ul className="flex gap-1 rounded-xl bg-white p-1">
      {ACTIVITYNAVIGATIONS.map((tab) => {
        return (
          <NavLink
            to={tab.href}
            key={tab.label}
            end={tab.end}
            className="block flex-1"
          >
            {({ isActive }) => (
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full cursor-pointer text-xs transition-all md:text-sm ${isActive ? "hover:bg-primary" : "hover:bg-transparent"}`}
              >
                {tab.label}
              </Button>
            )}
          </NavLink>
        );
      })}
    </ul>
  );
}

export default ActivityNavigations;
