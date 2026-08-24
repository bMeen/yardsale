import { formatTimeLeft } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

function CountdownTimer({
  endsAt,
  addPrefix = true,
}: {
  endsAt: Date;
  addPrefix?: boolean;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endsAt.getTime() - Date.now()),
  );

  useEffect(() => {
    const update = () => {
      setRemaining(Math.max(0, endsAt.getTime() - Date.now()));
    };

    update();

    const intervalId = setInterval(update, 1000);

    return () => clearInterval(intervalId);
  }, [endsAt]);

  const { label, urgent } = formatTimeLeft(remaining);

  return (
    <span
      className={`flex items-center gap-1 font-mono text-xs font-medium md:text-[13px] ${
        urgent ? "text-red-500" : "text-foreground"
      }`}
    >
      <Clock size={16} className="shrink-0" />
      {addPrefix && "Ends in "}
      {label}
    </span>
  );
}
export default CountdownTimer;
