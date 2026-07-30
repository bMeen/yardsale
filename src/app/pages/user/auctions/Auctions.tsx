import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import NavigationTabs from "@/components/NavigationTabs";
import Title from "@/components/Title";
import Categories from "@/features/auction/components/Categories";
import { AUCTIONTABS } from "@/shared/constants";
import AuctionList from "@/features/auction/components/auctions/AuctionList";
import SearchInput from "@/features/auction/components/auctions/SearchInput";

function Auctions() {
  return (
    <PageContainer>
      <PageHeader>
        <div className="space-y-3 px-2 pt-4 pb-3">
          <Title>Auctions</Title>
          <SearchInput />

          {/*  <div className="flex scrollbar-none gap-2 overflow-x-auto pb-0.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => update("status", s)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${filters.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
              >
                {s}
              </button>
            ))}
          </div> */}
          <Categories />
        </div>
      </PageHeader>
      <NavigationTabs tabs={AUCTIONTABS} />

      <AuctionList />
    </PageContainer>
  );
}

export default Auctions;
