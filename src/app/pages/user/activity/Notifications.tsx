import { Modal } from "@/components/custom-modal/Modal";
import CustomPagination from "@/components/CustomPagination";
import EmptyState from "@/components/EmptyState";
import FullNotification from "@/features/notification/components/FullNotification";
import NotificationCard from "@/features/notification/components/NotificationCard";
import NotificationCardSkeleton from "@/features/notification/components/NotificationCardSkeleton";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { getPagination, groupNotifications } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useState } from "react";

function Notifications() {
  const [page, setPage] = useState(1);
  const { isLoading, notifications, count } = useNotifications(page);
  const { page: currentPage, totalPages } = getPagination(page, count!);

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

  return (
    <div>
      {groupedNotifications.map((group) => (
        <div key={group.label} className="mb-5 space-y-3">
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase md:text-sm">
            {group.label}
          </p>
          <ul className="space-y-3">
            {group.items?.map((notification) => (
              <Modal key={notification.id}>
                <Modal.Trigger>
                  <NotificationCard notification={notification} />
                </Modal.Trigger>

                <Modal.Content>
                  <FullNotification notification={notification} />
                </Modal.Content>
              </Modal>
            ))}
          </ul>
        </div>
      ))}

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default Notifications;
