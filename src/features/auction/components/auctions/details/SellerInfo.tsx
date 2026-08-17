import UserAvatar from "@/components/UserAvatar";
import type { User } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

function SellerInfo({ seller }: { seller: User }) {
  const { user } = useCurrentUser();
  const isMine = seller.id === user?.profile?.id;

  return (
    <div className="bg-secondary/70 flex items-center gap-3 rounded-2xl p-4">
      <UserAvatar url={seller.avatar_url || ""} fallback={seller.username[0]} />

      <div className="min-w-0 flex-1">
        {/* <p className="text-sm font-semibold">{seller.}</p> */}
        <p className="text-muted-foreground font-mono text-xs">
          @{seller.username}
        </p>
      </div>
      {isMine && (
        <span className="text-primary bg-primary/10 rounded-full px-2.5 py-1 text-xs font-semibold">
          Your listing
        </span>
      )}
    </div>
  );
}

export default SellerInfo;
