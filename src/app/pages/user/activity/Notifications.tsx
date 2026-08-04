import EmptyState from "@/components/EmptyState";
import NotificationCard from "@/features/notification/components/NotificationCard";
import NotificationCardSkeleton from "@/features/notification/components/NotificationCardSkeleton";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { groupNotifications } from "@/lib/utils";
import { Bell } from "lucide-react";

function Notifications() {
  const { isLoading, notifications } = useNotifications();

  if (isLoading)
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <NotificationCardSkeleton key={index} />
        ))}
      </ul>
    );

  if (notifications?.length === 0)
    return (
      <EmptyState
        icon={<Bell size={28} />}
        title="No notifications"
        description="You're all caught up! Check back when there's auction activity."
      />
    );

  if (notifications === null) return;
  const groupedNotifications = groupNotifications(notifications);

  return groupedNotifications.map((group) => (
    <div key={group.label} className="mb-5 space-y-3">
      <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase md:text-sm">
        {group.label}
      </p>
      <ul className="space-y-3">
        {group.items?.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </ul>
    </div>
  ));
}

export default Notifications;
