import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getInitials } from "@/lib/utils";

function ProfileInfo() {
  const { user } = useCurrentUser();

  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
        {user?.profile?.avatar_url ? (
          <img
            src={user?.profile?.avatar_url}
            alt={user?.profile?.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-xl font-semibold md:text-3xl">
            {getInitials(user?.profile.full_name ?? "")}
          </span>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg leading-tight font-bold md:text-2xl">
          {user?.profile.full_name}
        </h2>
        <p className="text-muted-foreground font-mono text-xs md:text-sm">
          @{user?.profile.username}
        </p>
      </div>
    </div>
  );
}

export default ProfileInfo;
