import ActivityNavigations from "@/components/ActivityNavigations";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import MarkAllRead from "@/features/notification/components/MarkAllRead";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { Outlet, useLocation } from "react-router";

function ActivityLayout() {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const show =
    location.pathname === "/activity" && unreadCount ? unreadCount > 0 : false;

  return (
    <PageContainer>
      <PageHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Title>Activity</Title>

            {show && <MarkAllRead />}
          </div>

          <ActivityNavigations />
        </div>
      </PageHeader>

      <div className="px-2 py-4 md:p-4">
        <Outlet />
      </div>
    </PageContainer>
  );
}

export default ActivityLayout;
