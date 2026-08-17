import { getImageUrl } from "@/features/auction/apiAuctions";
import type { Image } from "@/features/auction/types";
import { useState } from "react";

function ImageGallery({ images }: { images: Image[] }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return;

  return (
    <div>
      <div className="relative h-100 w-full overflow-hidden md:h-125">
        <img
          src={getImageUrl(images[active].storage_path)}
          alt={`auction-image-${active}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="bg-card flex gap-2 p-3">
          {images.map((image, index) => (
            <button
              key={image.storage_path}
              onClick={() => setActive(index)}
              className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors ${index === active ? "border-primary" : "border-transparent"}`}
            >
              <img
                src={getImageUrl(image.storage_path)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
