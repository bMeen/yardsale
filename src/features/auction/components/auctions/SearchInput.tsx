import { useDebounce } from "@/shared/hooks/useDebounce";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const intialValue = searchParams.get("search") || "";

  const [search, setSearch] = useState(intialValue);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    params.delete("page");

    setSearchParams(params);
  }, [debouncedSearch, searchParams, setSearchParams]);

  return (
    <div className="bg-muted flex h-8 items-center gap-2 rounded-xl border border-transparent px-3 transition-colors focus-within:bg-white">
      <Search size={15} className="text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder="Search by title…"
        className="flex-1 bg-transparent text-sm outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;
