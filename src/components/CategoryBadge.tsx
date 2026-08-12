import type { Category } from "@/features/auction/types";
import { Badge } from "./ui/badge";

type BadgeProps = {
  category: Category;
  onClick: () => void;
  className?: string;
  active: string;
};

function CategoryBadge({ category, onClick, className, active }: BadgeProps) {
  return (
    <Badge
      key={category}
      variant={active === category ? "default" : "secondary"}
      className={`capitalize hover:cursor-pointer ${className}`}
      onClick={onClick}
    >
      {category.replace("_", " ").toLowerCase()}
    </Badge>
  );
}

export default CategoryBadge;
