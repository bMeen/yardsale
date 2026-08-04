import { NOTIFICATION_CONFIG } from "@/shared/constants";
import type { Notification } from "../types";
import { formatNotificationTime } from "@/lib/utils";

function NotificationCard({ notification }: { notification: Notification }) {
  const config = NOTIFICATION_CONFIG[notification.type];

  return (
    <li
      className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border-[0.5px] p-3 text-left transition-colors hover:shadow-sm ${notification.is_read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.className}`}
      >
        <config.icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold">{notification.title}</p>
          {!notification.is_read && (
            <div className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug">
          {notification.message}
        </p>
        <p className="text-muted-foreground/60 mt-1 text-[10px] md:text-xs">
          {formatNotificationTime(new Date(notification.created_at))}
        </p>
      </div>
    </li>
  );
}

export default NotificationCard;
