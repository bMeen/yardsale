import { NOTIFICATION_CONFIG } from "@/shared/constants";
import type { Notification } from "../types";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useModal } from "@/components/custom-modal/context";
import { useEffect } from "react";
import { useReadNotification } from "../hooks/useReadNotification";

function FullNotification({ notification }: { notification: Notification }) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const { read } = useReadNotification();
  const { close } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (notification.is_read) return;
    read(notification.id);
  }, []);

  function goToAuction() {
    navigate(`/auctions/${notification.reference_id}`);
  }

  return (
    <div className="space-y-4 p-4 md:p-0">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.className}`}
      >
        <config.icon size={22} />
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {notification.type.replaceAll("_", " ")}
        </p>
        <h3 className="font-display text-xl font-bold">{notification.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {notification.message}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatTime(new Date(notification.created_at))}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="h-11 flex-1 cursor-pointer"
          onClick={close}
        >
          Close
        </Button>
        {(notification.reference_type === "AUCTION" ||
          notification.reference_type === "BID") && (
          <Button className="h-11 flex-1 cursor-pointer" onClick={goToAuction}>
            View Auction
          </Button>
        )}
      </div>
    </div>
  );
}

export default FullNotification;
