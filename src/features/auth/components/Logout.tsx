import { Modal } from "@/components/custom-modal/Modal";
import MenuItem from "@/features/identity/components/MenuItem";
import { LogOut } from "lucide-react";
import LogoutPrompt from "./LogoutPrompt";

function Logout() {
  return (
    <Modal>
      <Modal.Trigger>
        <MenuItem Icon={LogOut} label="Logout" />
      </Modal.Trigger>
      <Modal.Content>
        <LogoutPrompt />
      </Modal.Content>
    </Modal>
  );
}

export default Logout;
