import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useWalletAccount } from "../hooks/useWalletAccount";

function ProfileWalletCard() {
  const { accounts, available } = useWalletAccount();
  const disableTopUp = available && available?.balance >= 10000000;

  return (
    <div className="bg-primary text-primary-foreground space-y-5 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Wallet size={16} />
        <span className="text-sm font-medium md:text-base">Wallet</span>
      </div>

      <ul className="grid grid-cols-2 gap-4">
        {accounts?.map((account) => (
          <div key={account.account_type}>
            <p className="text-xs tracking-wider uppercase md:text-sm">
              {account.account_type}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold md:text-2xl">
              {formatAmount(account.balance)}
            </p>

            {account.account_type === "RESERVED" && (
              <p className="text-secondary text-[10px] md:text-sm">
                Tied up in active bids
              </p>
            )}
          </div>
        ))}
      </ul>

      <Button
        disabled={disableTopUp}
        variant="secondary"
        className="w-full cursor-pointer rounded-2xl"
        size="lg"
      >
        Wallet Top Up
      </Button>
    </div>
  );
}

export default ProfileWalletCard;
