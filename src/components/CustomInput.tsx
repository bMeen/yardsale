import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, type HTMLInputTypeAttribute } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  className?: string;
};

function CustomInput<T extends FieldValues>({
  control,
  name,
  placeholder,
  type,
  label,
  className,
}: Props<T>) {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={name} className="">
            {label}
          </FieldLabel>
          <div className="relative">
            <Input
              {...field}
              value={field.value ?? ""}
              id={name}
              type={show ? "text" : type}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              className={`focus-visible:border focus-visible:ring-0 ${className}`}
              onChange={(e) => {
                const value = e.target.value;
                if (type === "number") {
                  field.onChange(value === "" ? undefined : Number(value));

                  return;
                }

                field.onChange(value);
              }}
            />
            {type === "password" ||
              (type === "number" && (
                <span
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                >
                  {type === "number" ? (
                    <p className="text-muted-foreground">₦</p>
                  ) : show ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                  {/* {show ? <EyeOff size={16} /> : <Eye size={16} />} */}
                </span>
              ))}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default CustomInput;
