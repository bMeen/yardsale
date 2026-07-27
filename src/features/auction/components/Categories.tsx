import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Furniture",
  "Books",
  "Toys",
  "Sports",
  "Art",
  "Jewelry",
  "Garden",
  "Kitchen",
  "Other",
];

function Categories() {
  return (
    <div className="flex scrollbar-none gap-2 overflow-x-auto">
      {CATEGORIES.map((category) => (
        <Badge variant="secondary">{category}</Badge>
      ))}
    </div>
  );
}

export default Categories;
