import { useModal } from "@/components/custom-modal/context";
import CustomInput from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Minimum 3 characters")
    .max(30, "Maximum 30 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
});

const editProfileSchema = z.object({
  fullname: z.string().trim().min(5, "Full Name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Minimum 3 characters")
    .max(30, "Maximum 30 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
});

type FormFields = {
  fullname?: string;
  username?: string;
};

type EditProfileProps = {
  mode?: "edit" | "updateUsername";
};

export type EditProfileFields = z.infer<typeof editProfileSchema>;

export type UpdateUsernameFields = z.infer<typeof usernameSchema>;

function EditProfile({ mode = "edit" }: EditProfileProps) {
  const { close } = useModal();
  const { user } = useCurrentUser();
  const { isPending: isSubmitting, update } = useUpdateProfile();

  const isUpdateUsername = mode === "updateUsername";

  const { control, handleSubmit } = useForm<
    EditProfileFields | UpdateUsernameFields
  >({
    defaultValues: isUpdateUsername
      ? {
          username: user?.profile?.username ?? "",
        }
      : {
          fullname: user?.profile?.full_name ?? "",
          username: user?.profile?.username ?? "",
        },
    resolver: zodResolver(
      isUpdateUsername ? usernameSchema : editProfileSchema,
    ),
  });

  function onSubmit(values: FormFields) {
    const data = isUpdateUsername
      ? {
          p_username: values.username,
        }
      : {
          p_full_name: values.fullname,
          p_username: values.username,
        };
    update(data, {
      onSuccess: () => close(),
      onError: () => close(),
    });
  }

  return (
    <section className="space-y-4 p-4 md:p-0">
      <div>
        <h3 className="font-display text-xl font-bold">
          {isUpdateUsername ? "Pick your username" : "Edit Profile"}
        </h3>
        {isUpdateUsername && (
          <p className="text-muted-foreground mt-1.5 text-sm">
            Your placeholder is{" "}
            <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              {user?.profile?.username}
            </span>{" "}
            — change it now or anytime from Profile.
          </p>
        )}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {!isUpdateUsername && (
          <CustomInput
            control={control}
            name="fullname"
            type="text"
            label="Full Name"
            placeholder="Enter a fullname"
          />
        )}

        <CustomInput
          control={control}
          name="username"
          type="text"
          label="Username"
          placeholder="Enter a username"
        />

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="h-11 flex-1 cursor-pointer"
            onClick={close}
          >
            {isUpdateUsername ? "Skip for Now" : "Close"}
          </Button>

          <Button className="h-11 flex-1 cursor-pointer" type="submit">
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isUpdateUsername ? "Update" : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export default EditProfile;
