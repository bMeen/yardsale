import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import ImageThumbnail from "./ImageThumbmail";
import { MAX_AUCTION_IMAGES } from "@/shared/constants";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  useDeleteImageAuction,
  useUploadImageAuction,
} from "@/features/auction/hooks/useAuctionImages";
import { getImageUrl } from "@/features/auction/apiAuctions";

type UploadProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

function AuctionImageUpload<T extends FieldValues>({
  control,
  name,
}: UploadProps<T>) {
  const { field, fieldState } = useController({
    control,
    name,
  });
  const imagePaths = (field.value ?? []) as string[];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { isUploading, uploadMutate } = useUploadImageAuction();
  const { isDeleting, deleteMutate, deleteVariables } = useDeleteImageAuction();

  async function handleFiles(files: FileList | File[]) {
    setUploadError(null);

    const selectedFiles = Array.from(files);

    const availableSlots = MAX_AUCTION_IMAGES - imagePaths.length;

    if (availableSlots <= 0) {
      setUploadError(
        `You can upload a maximum of ${MAX_AUCTION_IMAGES} images.`,
      );
      return;
    }

    const filesToUpload = selectedFiles.slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      setUploadError(
        `You can only add ${availableSlots} more image${availableSlots === 1 ? "" : "s"}.`,
      );
    }

    const results = await Promise.allSettled(
      filesToUpload.map((file) => uploadMutate(file)),
    );
    const successfulPaths: string[] = [];
    const errors: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        if (!result.value) return;
        successfulPaths.push(result.value);
      } else {
        errors.push(
          result.reason instanceof Error
            ? result.reason.message
            : "Failed to upload image.",
        );
      }
    });

    if (successfulPaths.length > 0) {
      field.onChange([...imagePaths, ...successfulPaths]);
    }

    if (errors.length > 0) {
      setUploadError(errors[0]);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    await handleFiles(e.target.files);
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (isUploading || isDeleting) return;
    if (!e.dataTransfer.files.length) return;

    await handleFiles(e.dataTransfer.files);
  }

  async function handleDelete(path: string) {
    setUploadError(null);
    try {
      await deleteMutate(path);
      field.onChange(imagePaths.filter((imagePath) => imagePath !== path));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to delete image.",
      );
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!isUploading && !isDeleting) {
      setIsDragging(true);
    }
  }

  const className = [
    "flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed transition-colors",
    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    fieldState.error
      ? "border-destructive/50 bg-destructive/5"
      : isDragging
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50 hover:bg-primary/5",
    (isUploading || isDeleting) && "pointer-events-none opacity-70",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="auction-images" className="font-semibold">
        Images{" "}
        <span className="text-muted-foreground font-normal">
          {imagePaths.length
            ? `${imagePaths.length}/${MAX_AUCTION_IMAGES}`
            : `(up to ${MAX_AUCTION_IMAGES})`}
        </span>
      </FieldLabel>
      {imagePaths.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {imagePaths.map((path, index) => (
            <ImageThumbnail
              key={path}
              url={getImageUrl(path)}
              index={index}
              isDeleting={isDeleting && deleteVariables === path}
              onDelete={() => handleDelete(path)}
            />
          ))}
        </div>
      )}
      {imagePaths.length < MAX_AUCTION_IMAGES && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={className}
        >
          {isUploading ? (
            <>
              {" "}
              <Loader2 className="text-muted-foreground animate-spin" />{" "}
              <p className="text-muted-foreground text-xs font-medium">
                {" "}
                Uploading...{" "}
              </p>{" "}
            </>
          ) : (
            <>
              {" "}
              <ImagePlus className="text-muted-foreground" />{" "}
              <p className="text-muted-foreground text-sm font-medium">
                {" "}
                Drag & drop or click to add photos{" "}
              </p>{" "}
              <p className="text-muted-foreground/90 text-xs">
                {" "}
                JPEG · PNG · WEBP · Max 10 MB each{" "}
              </p>{" "}
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        id="auction-images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleChange}
        /*  disabled={
          isUploading || isDeleting || imagePaths.length >= MAX_AUCTION_IMAGES
        } */
        disabled
      />
      {uploadError && <FieldError>{uploadError}</FieldError>}{" "}
      {fieldState.error && !uploadError && (
        <FieldError>{fieldState.error.message}</FieldError>
      )}
    </Field>
  );
}

export default AuctionImageUpload;
