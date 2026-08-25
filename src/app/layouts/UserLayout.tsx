import BottomNav from "@/components/BottomNav";
import { Modal } from "@/components/custom-modal/Modal";
import Sidebar from "@/components/Sidebar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import EditProfile from "@/features/identity/components/EditProfile";
import { useNotificationsRealtime } from "@/features/notification/hooks/useNotifications";
import { useWalletRealtime } from "@/features/wallet/hooks/useWalletAccount";
import { hasUpdatedUsername } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";

function UserLayout() {
  const { user } = useCurrentUser();
  useNotificationsRealtime();
  useWalletRealtime();
  const username = user?.profile?.username;
  const [openUpdateUsername, setOpenUpdateUsername] = useState(false);

  useEffect(() => {
    function check() {
      if (username === undefined) return;
      setOpenUpdateUsername(!hasUpdatedUsername(username));
    }

    check();
  }, [username]);

  return (
    <>
      <div className="bg-background flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
        <BottomNav />
      </div>

      <Modal open={openUpdateUsername} onOpenChange={setOpenUpdateUsername}>
        <Modal.Content>
          <EditProfile mode="updateUsername" />
        </Modal.Content>
      </Modal>
    </>
  );
}

export default UserLayout;
