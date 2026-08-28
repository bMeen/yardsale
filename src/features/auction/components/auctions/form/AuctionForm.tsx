import {
  schema,
  type AuctionDetails,
  type AuctionFormFields,
  type Category,
} from "@/features/auction/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuctionImageUpload from "./AuctionImageUpload";
import DateTime from "./DateTime";
import Description from "./Description";
import { Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";
import CategoryToggle from "./CategoryToggle";
import {
  useCreateAuction,
  useUpdateAuction,
} from "@/features/auction/hooks/useAuction";
import { KOBO_RATE, MINUTE } from "@/shared/constants";

function AuctionForm({
  auction,
  close,
}: {
  auction?: AuctionDetails;
  close?: () => void;
}) {
  const now = new Date();
  const defaultEndsAt = new Date(now.getTime() + 20 * MINUTE);
  const isEditSession = Boolean(auction?.id);

  const defaultValues: AuctionFormFields = {
    title: auction?.title ?? "",
    description: auction?.description ?? "",
    category: (auction?.category ?? "") as Exclude<Category, "ALL">,
    starting_price: auction?.starting_price
      ? auction?.starting_price / KOBO_RATE
      : "",
    starts_at: auction?.starts_at ? new Date(auction.starts_at) : now,
    ends_at: auction?.ends_at ? new Date(auction.ends_at) : defaultEndsAt,
    temp_image_paths:
      auction?.auction_images?.map((image) => image.storage_path) ?? [],
  };

  const originalStartsAt = auction?.starts_at
    ? new Date(auction.starts_at)
    : undefined;

  const originalEndsAt = auction?.ends_at
    ? new Date(auction.ends_at)
    : undefined;

  const refinedSchema = schema
    .refine(
      (data) => {
        // CREATE
        if (!isEditSession) {
          return data.starts_at > new Date();
        }

        // EDIT
        if (!originalStartsAt) {
          return data.starts_at > new Date();
        }

        const startWasChanged =
          data.starts_at.getTime() !== originalStartsAt.getTime();

        // Existing historical start is allowed
        // when it hasn't been changed.
        if (!startWasChanged) {
          return true;
        }

        // New start must be future.
        return data.starts_at > new Date();
      },
      {
        message: "Auction must start in the future",
        path: ["starts_at"],
      },
    )

    .refine(
      (data) => {
        // End must ALWAYS be after start.
        return data.ends_at > data.starts_at;
      },
      {
        message: "End date and time must be after the start date and time",
        path: ["ends_at"],
      },
    )

    .refine(
      (data) => {
        // CREATE
        if (!isEditSession) {
          return data.ends_at > new Date();
        }

        if (!originalEndsAt) {
          return data.ends_at > new Date();
        }

        const endWasChanged =
          data.ends_at.getTime() !== originalEndsAt.getTime();

        // Existing historical end is allowed
        // if it wasn't changed.
        if (!endWasChanged) {
          return true;
        }

        // A newly selected end must be future.
        return data.ends_at > new Date();
      },
      {
        message: "A new auction end time must be in the future",
        path: ["ends_at"],
      },
    );

  const { handleSubmit, control } = useForm<AuctionFormFields>({
    resolver: zodResolver(refinedSchema),
    defaultValues,
  });

  const { isPending, publish } = useCreateAuction();
  const { isUpdating, update } = useUpdateAuction();
  const isWorking = isPending || isUpdating;
  const label = isEditSession
    ? isUpdating
      ? "Updating..."
      : "Update Auction"
    : isPending
      ? "Publishing..."
      : "Publish Auction";

  function onSubmit(values: AuctionFormFields) {
    const editPayload = {
      p_category: values.category,
      p_description: values.description,
      p_ends_at: values.ends_at.toISOString(),
      p_starting_price: Number(values.starting_price) * KOBO_RATE,
      p_starts_at: values.starts_at.toISOString(),
      p_title: values.title,
    };

    if (isEditSession) {
      if (!auction?.id) return;

      const editValues =
        auction.status === "ACTIVE"
          ? {
              p_ends_at: values.ends_at.toISOString(),
              p_auction_id: auction.id,
            }
          : {
              ...editPayload,
              p_auction_id: auction.id,
            };

      update(editValues, {
        onSuccess: () => close?.(),
        onError: () => close?.(),
      });

      return;
    }

    publish({
      ...values,
      starting_price: Number(values.starting_price) * KOBO_RATE,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {!isEditSession && (
        <AuctionImageUpload control={control} name="temp_image_paths" />
      )}

      <CustomInput
        control={control}
        name="title"
        label="Title"
        type="text"
        className="bg-muted h-10 border-transparent focus:bg-white"
      />

      <Description control={control} name="description" />

      <CategoryToggle control={control} name="category" />

      <CustomInput
        control={control}
        name="starting_price"
        label="Starting Price"
        type="number"
        className="bg-muted h-10 [appearance:textfield] border-transparent focus:bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <div>
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 md:gap-2">
          <DateTime
            control={control}
            name="starts_at"
            label="Start Date / Time"
          />
          <DateTime control={control} name="ends_at" label="End Date / Time" />
        </div>

        <p className="text-muted-foreground mt-2 text-center text-xs">
          Minimum duration: 20 minutes. End time must be in the future.
        </p>
      </div>

      {!isEditSession && (
        <div className="bg-secondary flex items-start gap-2 rounded-xl p-3">
          <Tag size={14} className="text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-muted-foreground text-xs">
            A non-refundable{" "}
            <span className="text-foreground font-semibold">
              ₦300 listing fee
            </span>{" "}
            applies when you publish. The platform also takes a 3% settlement
            fee from the winning bid.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {isEditSession && (
          <Button
            variant="secondary"
            className="h-12 flex-1 cursor-pointer"
            onClick={close}
          >
            Close
          </Button>
        )}

        <Button
          type="submit"
          disabled={isWorking}
          className="font-display flex h-12 w-full flex-1 cursor-pointer items-center justify-center gap-2 text-lg font-bold tracking-widest uppercase"
        >
          {isWorking && <Loader2 size={15} className="animate-spin" />}
          {label}
        </Button>
      </div>
    </form>
  );
}

export default AuctionForm;
