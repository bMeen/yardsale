import CategoryBadge from "@/components/CategoryBadge";
import { FieldError, FieldLabel, Field } from "@/components/ui/field";
import { CATEGORIES } from "@/shared/constants";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type ToggleProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

function CategoryToggle<T extends FieldValues>({
  control,
  name,
}: ToggleProps<T>) {
  const { field, fieldState } = useController({
    control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid} className="gap-2">
      <FieldLabel htmlFor={name} className="">
        Category
      </FieldLabel>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter((category) => category !== "ALL").map((category) => (
          <CategoryBadge
            key={category}
            category={category}
            onClick={() => field.onChange(category)}
            active={field.value}
            className="md:h-8 md:px-4 md:py-2 md:text-sm"
          />
        ))}
      </div>

      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

export default CategoryToggle;
