import { User } from "lucide-react";
import MenuItem from "./MenuItem";
import { Modal } from "@/components/custom-modal/Modal";
import EditProfile from "./EditProfile";
import Logout from "@/features/auth/components/Logout";

function ProfileMenu() {
  return (
    <ul className="space-y-2">
      <Modal>
        <Modal.Trigger>
          <MenuItem Icon={User} label="Edit Profile" />
        </Modal.Trigger>

        <Modal.Content>
          <EditProfile />
        </Modal.Content>
      </Modal>

      <Logout />
    </ul>
  );
}

export default ProfileMenu;
