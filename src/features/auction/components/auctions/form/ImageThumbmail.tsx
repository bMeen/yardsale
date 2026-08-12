import { Loader2, X } from "lucide-react";

interface ImageThumbnailProps {
  url: string;
  index: number;
  isDeleting: boolean;
  onDelete: () => void;
}

function ImageThumbnail({
  url,
  index,
  isDeleting,
  onDelete,
}: ImageThumbnailProps) {
  return (
    <div className="bg-muted border-border relative h-20 w-24 overflow-hidden rounded-xl border">
      {" "}
      <img
        src={url}
        alt={`Auction image ${index + 1}`}
        className="h-full w-full object-cover"
      />{" "}
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={`Remove image ${index + 1}`}
        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {" "}
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}{" "}
      </button>{" "}
      {index === 0 && (
        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
          {" "}
          MAIN{" "}
        </span>
      )}{" "}
    </div>
  );
}

export default ImageThumbnail;
