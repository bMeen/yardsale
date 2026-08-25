import CustomPagination from "@/components/CustomPagination";
import EmptyState from "@/components/EmptyState";
import TransactionCard from "@/features/wallet/components/TransactionCard";
import TransactionCardSkeleton from "@/features/wallet/components/TransactionCardSkeleton";
import { useWalletActivity } from "@/features/wallet/hooks/useWalletActivity";
import { getPagination } from "@/lib/utils";
import { ReceiptText } from "lucide-react";
import { useState } from "react";

function Transactions() {
  const [page, setPage] = useState(1);
  const { transactions, isLoading, count } = useWalletActivity(page);
  const { page: currentPage, totalPages } = getPagination(page, count);

  if (isLoading)
    return (
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <TransactionCardSkeleton key={index} />
        ))}
      </ul>
    );

  if (transactions?.length === 0)
    return (
      <EmptyState
        icon={<ReceiptText size={28} />}
        title="No transactions yet"
        description="Your wallet activity — bids, fees, and settlements — will appear here."
      />
    );

  return (
    <div>
      <ul className="space-y-3 pb-4">
        {transactions.map((transaction) => (
          <TransactionCard transaction={transaction} key={transaction.id} />
        ))}
      </ul>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default Transactions;
