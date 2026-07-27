import CustomInput from "@/components/CustomInput";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface LoginFormType {
  email: string;
  password: string;
}

function LoginForm() {
  const { control, handleSubmit } = useForm<LoginFormType>({
    defaultValues: {
      email: "seed_john@yardsale.dev",
      password: "YardSaleSeed!2026",
    },
  });

  async function onSubmit(values: LoginFormType) {
    console.log(values);
  }

  return (
    <div className="w-full max-w-md space-y-3.5 rounded-lg bg-white p-4 sm:p-8">
      <div className="flex items-center justify-center text-center">
        <Logo />
      </div>
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
          <Button size="lg">Login</Button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
