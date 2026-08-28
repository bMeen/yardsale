import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useNavigate } from "react-router";

function ProfileActivityStats() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const stats = [
    { label: "Items\nSold", value: user?.profile?.sold_count, type: "sold" },
    { label: "Items\nWon", value: user?.profile?.won_count, type: "won" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.type}
          className="bg-card cursor-pointer rounded-2xl p-4 text-center shadow-xs"
          onClick={() => navigate(`/profile/activity/${stat.type}`)}
        >
          <p className="font-display text-xl font-bold md:text-3xl">
            {stat.value}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-tight whitespace-pre-line md:text-sm">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ProfileActivityStats;
