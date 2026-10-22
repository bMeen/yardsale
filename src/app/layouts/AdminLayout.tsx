import Topbar from "@/components/Topbar";
import { Outlet } from "react-router";

function AdminLayout() {
  return (
    <div className="bg-secondary h-screen overflow-hidden p-4 lg:p-6">
      <div className="bg-background mx-auto flex h-full min-h-0 max-w-360 flex-col overflow-hidden rounded-2xl">
        <Topbar />

        <main className="min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
