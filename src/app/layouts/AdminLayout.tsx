import Topbar from "@/components/Topbar";
import { Outlet } from "react-router";

function AdminLayout() {
  return (
    <div className="bg-secondary min-h-screen p-4 lg:p-6">
      <div className="bg-background mx-auto flex min-h-[calc(100vh-2rem)] max-w-360 flex-col overflow-hidden rounded-2xl lg:min-h-[calc(100vh-3rem)]">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
