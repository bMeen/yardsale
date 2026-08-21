import { useModal } from "@/components/custom-modal/context";
import CustomInput from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

const schema = z.object({
  fullname: z.string().trim().min(5, "Full Name is required"),
  username: z.string().trim().min(5, "Username is required"),
});

export type EditProfileFields = z.infer<typeof schema>;

function EditProfile() {
  const { close } = useModal();
  const { user } = useCurrentUser();
  const { isPending: isSubmitting, update } = useUpdateProfile();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullname: user?.profile?.full_name ?? "",
      username: user?.profile?.username ?? "",
    },
    resolver: zodResolver(schema),
  });

  function onSubmit(values: EditProfileFields) {
    const data = {
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
      <h3 className="font-display text-xl font-bold">Edit Profile</h3>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <CustomInput
          control={control}
          name="fullname"
          type="text"
          label="Full Name"
          placeholder="Enter a fullname"
        />

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
            Close
          </Button>

          <Button className="h-11 flex-1 cursor-pointer" type="submit">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </section>
  );
}

export default EditProfile;
