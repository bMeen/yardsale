import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MoreVertical } from "lucide-react";

function SellerMenu() {
  /*   const canShowSellerMenu =
    auction.isMine &&
    auctionBids.length === 0 &&
    (auction.status === "Scheduled" || auction.status === "Active"); */
  return (
    <MenubarMenu>
      <MenubarTrigger className="size-7">
        <MoreVertical size={20} />
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Edit</MenubarItem>
        <MenubarItem>Cancel</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}

export default SellerMenu;
