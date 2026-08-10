import PageHeader from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useWalletAccount } from "@/features/wallet/hooks/useWalletAccount";
import { formatAmount } from "@/lib/utils";
import { Wallet } from "lucide-react";

function Header() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { user } = useCurrentUser();
  const { isLoading, available } = useWalletAccount();

  return (
    <PageHeader>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm md:text-lg">{greeting}</p>
          <p className="font-display text-lg leading-tight font-bold md:text-2xl">
            {user?.profile.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700 md:flex">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-7" />
                <Skeleton className="h-5 w-16" />
              </>
            ) : (
              <>
                <Wallet size={16} />
                {available && (
                  <span className="font-mono text-xs font-semibold md:text-sm">
                    {formatAmount(available?.balance)}
                  </span>
                )}
              </>
            )}
          </div>

          <UserAvatar
            url={user?.profile.avatar_url || ""}
            fallback={user?.profile.full_name[0]}
          />
        </div>
      </div>
    </PageHeader>
  );
}

export default Header;
