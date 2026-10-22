import { STATUS_PILL } from "@/shared/constants";
import type { VisibleStatus } from "@/features/auction/types";
import { getImageUrl } from "@/features/auction/apiAuctions";
import { formatTime } from "@/lib/utils";
import { useNavigate } from "react-router";
import { useDashboardStats } from "../hooks/useDashboardStats";

function RecentActivitives() {
  const navigate = useNavigate();
  const { data } = useDashboardStats();

  if (!data) return;

  const { recent_activity } = data;

  return (
    <div className="bg-card flex flex-col rounded-2xl p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Activity</h2>
      </div>
      <ul className="flex-1 scrollbar-none space-y-0.5 overflow-y-auto">
        {recent_activity.map((activity) => {
          const imgSrc = getImageUrl(activity.image);

          return (
            <li
              className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
              key={activity.id}
              onClick={() => navigate(`/admin/auctions/${activity.id}`)}
            >
              <img
                src={imgSrc}
                alt={activity.title}
                className="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{activity.title}</p>
                <p className="text-muted-foreground text-xs">
                  {activity.seller.full_name} ·{" "}
                  {formatTime(new Date(activity.updated_at))}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[activity.status as VisibleStatus]}`}
              >
                {activity.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RecentActivitives;
