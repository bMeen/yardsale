import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { PER_PAGE } from "@/shared/constants";

function UnreadCount({ className }: { className?: string }) {
  const { unreadCount } = useNotifications();

  if (!unreadCount) return;

  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${className}`}
    >
      {unreadCount > PER_PAGE ? `${unreadCount}+` : unreadCount}
    </span>
  );
}

export default UnreadCount;
