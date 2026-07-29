import CustomInput from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "./hooks/useLogin";

const schema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFields = z.infer<typeof schema>;

function LoginForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginFields>({
    defaultValues: {
      /*  email: "",
      password: "", */
      email: "seed_john@yardsale.dev",
      password: "YardSaleSeed!2026",
    },
    resolver: zodResolver(schema),
  });
  const { login } = useLogin();

  function onSubmit(values: LoginFields) {
    login(values, {
      onSettled: () => {
        reset();
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <CustomInput
        control={control}
        name="email"
        type="email"
        label="Email"
        placeholder="Enter a valid email"
      />
      <CustomInput
        control={control}
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
      />

      <div className="flex items-center justify-end">
        <Button disabled={isSubmitting} type="submit" size="lg">
          Login
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
