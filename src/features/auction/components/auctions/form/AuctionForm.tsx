import * as z from "zod";
import { CategoryEnum } from "@/features/auction/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuctionImageUpload from "./AuctionImageUpload";
import DateTime from "./DateTime";
import Description from "./Description";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";
import CategoryToggle from "./CategoryToggle";

const schema = z
  .object({
    title: z
      .string({
        error: "Title is required",
      })
      .trim()
      .min(1, "Title is required"),

    description: z
      .string({
        error: "Description is required",
      })
      .trim()
      .min(1, "Description is required"),

    category: z.enum(CategoryEnum, {
      error: "Category is required",
    }),

    starting_price: z
      .number({
        error: "Starting price is required",
      })
      .positive("Starting price must be greater than 0"),

    starts_at: z.date({
      message: "Start date and time are required",
    }),

    ends_at: z.date({
      message: "End date and time are required",
    }),

    temp_image_paths: z
      .array(z.string(), { error: "At least one image is required" })
      .min(1, "At least one image is required.")
      .max(3, "You can upload a maximum of 3 images."),
  })
  .refine((data) => data.starts_at > new Date(), {
    message: "Auction must start in the future",
    path: ["starts_at"],
  })
  .refine((data) => data.ends_at > data.starts_at, {
    message: "End date and time must be after the start date and time",
    path: ["ends_at"],
  });

export type AuctionFormFields = z.infer<typeof schema>;

function AuctionForm() {
  const { handleSubmit, control } = useForm<AuctionFormFields>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: AuctionFormFields) {
    console.log(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <AuctionImageUpload control={control} name="temp_image_paths" />

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

      <div className="bg-secondary flex items-start gap-2 rounded-xl p-3">
        <Tag size={14} className="text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-muted-foreground text-xs">
          A non-refundable{" "}
          <span className="text-foreground font-semibold">
            ₦300 listing fee
          </span>{" "}
          applies when you publish. The platform also takes a 3% settlement fee
          from the winning bid.
        </p>
      </div>

      <Button
        type="submit"
        className="font-display flex h-12 w-full cursor-pointer items-center justify-center gap-2 text-lg font-bold tracking-widest uppercase"
      >
        Publish Auction
      </Button>
    </form>
  );
}

export default AuctionForm;

/* 

{
    p_auction_id?: string;
    p_category: Database["public"]["Enums"]["auction_category"];
    p_description: string;
    p_ends_at: string;
    p_image_storage_paths?: string[];
    p_starting_price: number;
    p_starts_at: string;
    p_title: string;
}
*/
