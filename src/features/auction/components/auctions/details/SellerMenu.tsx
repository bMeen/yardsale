import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MoreVertical } from "lucide-react";
import CancelAuction from "./CancelAuction";
import { useState } from "react";
import { Modal } from "@/components/custom-modal/Modal";
import type { AuctionDetails } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import AuctionForm from "../form/AuctionForm";
import { useModal } from "@/components/custom-modal/context";

function SellerMenu({ auction }: { auction: AuctionDetails }) {
  const { user } = useCurrentUser();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isMine = auction.seller.id === user?.profile?.id;
  const canShowSellerMenu =
    isMine && (auction.status === "SCHEDULED" || auction.status === "ACTIVE");

  if (!canShowSellerMenu) return;

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger className="size-7">
          <MoreVertical size={20} />
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setEditOpen(true)}>Edit</MenubarItem>
          <MenubarItem onClick={() => setCancelOpen(true)}>Cancel</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <Modal open={cancelOpen} onOpenChange={setCancelOpen}>
        <Modal.Content>
          <CancelAuction />
        </Modal.Content>
      </Modal>

      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <Modal.Content className="sm:max-w-2xl">
          <EditContent auction={auction} />
        </Modal.Content>
      </Modal>
    </>
  );
}

function EditContent({ auction }: { auction: AuctionDetails }) {
  const { close } = useModal();
  return (
    <section className="p-4 md:p-0">
      <AuctionForm auction={auction} close={close} />
    </section>
  );
}

export default SellerMenu;
