import PageContainer from "@/components/PageContainer";
import Title from "@/components/Title";
import DiscoverAuctions from "@/features/auction/components/discover/DiscoverAuctions";
import Categories from "@/features/auction/components/Categories";
import Featured from "@/features/auction/components/discover/Featured";
import Header from "@/features/identity/components/Header";
import { useSearchParams } from "react-router";

function Discover() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  return (
    <PageContainer className="space-y-3">
      <Header />

      <div className="space-y-7 px-2 md:px-4 md:py-5">
        <section className="space-y-3">
          <Title>Live &amp; Ending Soon</Title>

          <Featured />
        </section>

        <section className="space-y-2">
          <Title>Categories</Title>
          <Categories />
        </section>

        <section className="space-y-2">
          <Title>
            {currentCategory === "ALL"
              ? "All Auctions"
              : currentCategory.replace("_", " ")}
          </Title>

          <DiscoverAuctions />
        </section>
      </div>
    </PageContainer>
  );
}

export default Discover;
