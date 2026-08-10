import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { PER_PAGE } from "@/shared/constants";

function UnreadCount({
  type,
  className,
}: {
  type: "sidebar" | "bottomNav" | "activitybar";
  className?: string;
}) {
  const { unreadCount } = useNotifications();

  const styles = {
    sidebar: "h-5 w-5 text-[10px] bg-primary text-primary-foreground ml-auto",
    bottomNav:
      "bg-primary text-primary-foreground absolute -top-1 right-1 h-4 w-4  text-[9px]",
    activitybar: "h-5 w-5 text-[10px]",
  };

  if (!unreadCount) return;

  return (
    <span
      className={`flex items-center justify-center rounded-full font-bold ${styles[type]} ${className}`}
    >
      {unreadCount > PER_PAGE ? `${unreadCount}+` : unreadCount}
    </span>
  );
}

export default UnreadCount;
