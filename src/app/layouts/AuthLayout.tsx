import FullPage from "@/components/FullPage";
import Logo from "@/components/Logo";
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <FullPage>
      <div className="w-full max-w-md space-y-3.5 rounded-lg bg-white p-4 sm:p-8">
        <div className="flex items-center justify-center text-center">
          <Logo />
        </div>
        <Outlet />
      </div>
    </FullPage>
  );
}

export default AuthLayout;
