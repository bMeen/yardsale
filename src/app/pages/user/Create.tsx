import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import AuctionForm from "@/features/auction/components/auctions/form/AuctionForm";

function Create() {
  return (
    <PageContainer>
      <PageHeader>
        <Title>New Auction</Title>
      </PageHeader>

      <div className="mx-auto w-full max-w-2xl px-2 py-4 md:px-4 md:py-6">
        <AuctionForm />
      </div>
    </PageContainer>
  );
}

export default Create;
