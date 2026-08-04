import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { useState, type ChangeEvent } from "react";

function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const handleSearch = useDebouncedCallback((query: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("page");

      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }

      return params;
    });
  }, 500);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
    handleSearch.cancel();
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("search");
      params.delete("page");
      return params;
    });
  };

  return (
    <div className="bg-muted flex h-9 items-center gap-2 rounded-xl border border-transparent pr-0.5 pl-3 transition-colors focus-within:bg-white">
      <Search size={15} className="text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder="Search by title…"
        className="flex-1 bg-transparent text-sm outline-none"
        value={search}
        onChange={handleChange}
      />
      {searchParams.get("search") && (
        <Button
          variant="ghost"
          className="cursor-pointer"
          size="icon-sm"
          onClick={clearSearch}
        >
          <X size={15} className="text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}

export default SearchInput;
