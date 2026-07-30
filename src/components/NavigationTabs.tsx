import { Button } from "./ui/button";
import { useSearchParams } from "react-router";

function NavigationTabs<T extends string>({ tabs }: { tabs: T[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("type") || "ALL";

  function handleSetTab(value: T) {
    searchParams.set("type", value);
    if (searchParams.get("page")) searchParams.set("page", "1");
    if (searchParams.get("category")) searchParams.set("category", "ALL");
    setSearchParams(searchParams);
  }

  return (
    <div className="mx-2 my-2 flex gap-1 rounded-xl bg-white p-1 md:mx-auto md:w-[80%]">
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => handleSetTab(tab)}
          variant={active === tab ? "default" : "ghost"}
          className={`flex-1 cursor-pointer text-xs md:text-sm ${active === tab ? "hover:bg-primary" : "hover:bg-transparent"}`}
        >
          {tab.replace("_", " ")}
        </Button>
      ))}
    </div>
  );
}

export default NavigationTabs;
