import UserAvatar from "@/components/UserAvatar";
import type { User } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { formatAmount, getInitials } from "@/lib/utils";

function SellerInfo({
  seller,
  starting_price,
}: {
  seller: User;
  starting_price: number;
}) {
  const { user } = useCurrentUser();
  const isMine = seller.id === user?.profile?.id;

  return (
    <div className="bg-secondary/70 flex flex-col justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <UserAvatar
          url={seller.avatar_url || ""}
          fallback={getInitials(seller.full_name)}
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{seller.full_name}</p>
          <p className="text-muted-foreground font-mono text-xs">
            @{seller.username}
          </p>
        </div>
      </div>

      <div className="space-x-2">
        <span className="text-primary bg-primary/10 rounded-full px-2.5 py-1 text-xs font-semibold">
          Starting Price: {formatAmount(starting_price)}
        </span>

        {isMine && (
          <span className="text-primary bg-primary/10 rounded-full px-2.5 py-1 text-xs font-semibold">
            Your listing
          </span>
        )}
      </div>
    </div>
  );
}

export default SellerInfo;
