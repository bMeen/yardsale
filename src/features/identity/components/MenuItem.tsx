import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

function MenuItem({
  Icon,
  label,
  ...props
}: {
  Icon: LucideIcon;
  label: string;
} & ComponentProps<"button">) {
  return (
    <li>
      <button
        {...props}
        className="bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 transition-colors hover:shadow-xs"
      >
        <Icon size={17} />
        <span className="flex-1 text-left text-xs font-medium md:text-sm">
          {label}
        </span>
      </button>
    </li>
  );
}

export default MenuItem;
