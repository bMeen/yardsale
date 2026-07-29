import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import Auctions from "@/features/auction/components/Auctions";
import Categories from "@/features/auction/components/Categories";
import Featured from "@/features/auction/components/Featured";
import Header from "@/features/identity/components/Header";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router";

function Discover() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  return (
    <div className="flex-1 scrollbar-none space-y-3 overflow-y-auto pb-20">
      <Header />

      <section className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <Title>Live &amp; Ending Soon</Title>

          <Button
            variant="link"
            size="sm"
            className="gap-0.5 text-xs font-semibold md:text-base"
          >
            See all <ChevronRight size={13} />
          </Button>
        </div>
        <Featured />
      </section>

      <section className="space-y-2 px-2">
        <Title>Categories</Title>
        <Categories />
      </section>

      <section className="space-y-2 px-2">
        <Title>
          {currentCategory === "ALL"
            ? "All Auctions"
            : currentCategory.replace("_", " ")}
        </Title>

        <Auctions />
      </section>
    </div>
  );
}

export default Discover;
