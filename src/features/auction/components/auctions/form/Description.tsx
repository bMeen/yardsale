import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

function Description<T extends FieldValues>({ control, name }: Props<T>) {
  const { field, fieldState } = useController({
    control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={name}>Description</FieldLabel>
      <FieldDescription>
        Give a brief description about your item
      </FieldDescription>
      <Textarea
        {...field}
        id={name}
        aria-invalid={fieldState.invalid}
        className="bg-muted focus:ring-none h-20 resize-none border-transparent focus:bg-white"
        rows={10}
      />
      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
    </Field>
  );
}

export default Description;
