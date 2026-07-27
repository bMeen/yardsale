import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import Categories from "@/features/auction/components/Categories";
import Featured from "@/features/auction/components/Featured";
import Header from "@/features/identity/components/Header";
import { ChevronRight } from "lucide-react";

function Discover() {
  return (
    <div className="flex-1 scrollbar-none space-y-3 overflow-y-auto">
      <Header />

      <section className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <Title>Live &amp; Ending Soon</Title>

          <Button
            variant="link"
            size="sm"
            className="gap-0.5 text-xs font-semibold"
          >
            See all <ChevronRight size={13} />
          </Button>
        </div>
        <Featured />
      </section>

      <section className="space-y-1 px-2">
        <Title>Categories</Title>
        <Categories />
      </section>

      <section className="px-2">
        <Title>All Auctions</Title>
      </section>
    </div>
  );
}

export default Discover;
