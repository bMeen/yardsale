import { formatTimeLeft } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (endsAt.getTime() <= Date.now()) {
        setTick((t) => t + 1);
        return;
      }

      setTick((t) => t + 1);

      timeoutId = setTimeout(tick, 1000);
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, [endsAt]);

  const { label, urgent } = formatTimeLeft(endsAt);

  return (
    <span
      className={`flex items-center gap-1 font-mono text-xs font-medium md:text-sm ${
        urgent ? "text-red-500" : "text-foreground"
      }`}
    >
      <Clock size={11} className="shrink-0" />
      {label}
    </span>
  );
}
export default CountdownTimer;
