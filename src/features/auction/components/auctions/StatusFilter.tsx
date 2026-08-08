import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUCTIONSTATUSOPTIONS } from "@/shared/constants";
import { useSearchParams } from "react-router";

function StatusFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get("status") || null;

  function handleSetStatus(value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    params.delete("page");
    setSearchParams(params);
  }

  return (
    <div className="flex justify-end px-2">
      <Select items={AUCTIONSTATUSOPTIONS}>
        <SelectTrigger className="w-full max-w-48 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            {AUCTIONSTATUSOPTIONS.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                onClick={() => handleSetStatus(item.value)}
                disabled={item.value === currentStatus}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default StatusFilter;
