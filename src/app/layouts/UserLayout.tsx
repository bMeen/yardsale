import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router";

function UserLayout() {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default UserLayout;
