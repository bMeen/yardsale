import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router";
import type { Category } from "../types";

const CATEGORIES: Category[] = [
  "ALL",
  "ELECTRONICS",
  "PHONES_TABLETS",
  "COMPUTERS",
  "HOME_APPLIANCES",
  "FURNITURE",
  "FASHION",
  "BOOKS",
  "SPORTS",
  "TOYS",
  "AUTOMOTIVE",
  "OTHERS",
];

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  function handleSetCategory(value: string) {
    searchParams.set("category", value);
    if (searchParams.get("page")) searchParams.set("page", "1");
    setSearchParams(searchParams);
  }

  return (
    <div className="flex scrollbar-none gap-3 overflow-x-auto">
      {CATEGORIES.map((category) => (
        <Badge
          variant={currentCategory === category ? "default" : "secondary"}
          className="capitalize hover:cursor-pointer md:h-8 md:px-4 md:py-2 md:text-sm"
          onClick={() => handleSetCategory(category)}
        >
          {category.replace("_", " ")}
        </Badge>
      ))}
    </div>
  );
}

export default Categories;
