import AdminHeader from "@/components/AdminHeader";
import Dashboard from "@/features/admin/overview/components/Dashboard";
import DashboardSkeleton from "@/features/admin/overview/components/DashboardSkeleton";
import { useDashboardStats } from "@/features/admin/overview/hooks/useDashboardStats";

function Overview() {
  const { isLoading } = useDashboardStats();
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard"
        subtitle="Platform overview and marketplace activity"
        includeLive
      />

      {isLoading ? <DashboardSkeleton /> : <Dashboard />}
    </div>
  );
}

export default Overview;
