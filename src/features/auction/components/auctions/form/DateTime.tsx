import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { ChangeEvent } from "react";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  className?: string;
};

function DateTime<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  className,
}: Props<T>) {
  const { field, fieldState } = useController({
    control,
    name,
  });

  const value = field.value as Date | undefined;
  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      field.onChange(undefined);
      return;
    }

    if (value) {
      date.setHours(
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
        0,
      );
    }
    field.onChange(date);
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;

    if (!time) {
      field.onChange(value);
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const date = value ? new Date(value) : new Date();
    date.setHours(hours, minutes, 0, 0);
    field.onChange(date);
  };

  const timeValue = value ? format(value, "HH:mm") : "";

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={field.name}
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              className={cn(
                "h-10 w-full justify-start px-2 text-xs font-normal md:text-sm",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon />

              {value ? (
                format(value, "PPP 'at' HH:mm a")
              ) : (
                <span>Select date and time</span>
              )}
            </Button>
          }
        ></PopoverTrigger>

        <PopoverContent
          className="overflow-hidden p-0 md:w-(--anchor-width)"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateChange}
            disabled={disabled}
            className="w-full"
          />

          <Field className="border-t p-3">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground size-4" />
              <FieldLabel htmlFor={`${field.name}-time`}>Time</FieldLabel>
            </div>

            <Input
              id={`${field.name}-time`}
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              disabled={disabled}
            />
          </Field>
        </PopoverContent>
      </Popover>

      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

export default DateTime;
