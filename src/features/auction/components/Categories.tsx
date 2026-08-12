import { useSearchParams } from "react-router";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES } from "@/shared/constants";

function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "ALL";

  function handleSetCategory(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    params.delete("page");
    setSearchParams(params);
  }

  return (
    <div className="flex scrollbar-none gap-3 overflow-x-auto">
      {CATEGORIES.map((category) => (
        <CategoryBadge
          key={category}
          category={category}
          onClick={() => handleSetCategory(category)}
          active={currentCategory}
          className="md:h-8 md:px-4 md:py-2 md:text-sm"
        />
      ))}
    </div>
  );
}

export default Categories;
