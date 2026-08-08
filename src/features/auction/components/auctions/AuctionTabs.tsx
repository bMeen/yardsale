import { Button } from "../../../../components/ui/button";
import { useSearchParams } from "react-router";

function AuctionTabs<T extends string>({ tabs }: { tabs: T[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("type") || "ALL";

  function handleSetTab(value: T) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    params.delete("page");
    params.delete("category");
    params.delete("status");

    setSearchParams(params);
  }

  return (
    <div className="mx-2 my-4 flex rounded-xl bg-white p-1 md:mx-auto md:w-[80%]">
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => handleSetTab(tab)}
          size="sm"
          variant={active === tab ? "default" : "ghost"}
          className={`flex-1 cursor-pointer text-[10px] md:text-sm ${active === tab ? "hover:bg-primary" : "hover:bg-transparent"}`}
        >
          {tab.replace("_", " ")}
        </Button>
      ))}
    </div>
  );
}

export default AuctionTabs;
