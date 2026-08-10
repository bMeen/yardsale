import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import AuctionTabs from "@/features/auction/components/auctions/AuctionTabs";
import Title from "@/components/Title";
import Categories from "@/features/auction/components/Categories";
import { AUCTIONTABS } from "@/shared/constants";
import AuctionList from "@/features/auction/components/auctions/AuctionList";
import SearchInput from "@/features/auction/components/auctions/SearchInput";

function Auctions() {
  return (
    <PageContainer>
      <PageHeader>
        <div className="space-y-3">
          <Title>Auctions</Title>
          <SearchInput />
          <Categories />
        </div>
      </PageHeader>
      <AuctionTabs tabs={AUCTIONTABS} />

      <AuctionList />
    </PageContainer>
  );
}

export default Auctions;
