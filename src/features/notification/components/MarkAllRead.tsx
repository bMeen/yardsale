import { useModal } from "@/components/custom-modal/context";
import { Modal } from "@/components/custom-modal/Modal";
import { Button } from "@/components/ui/button";
import { Loader2, MailOpen } from "lucide-react";
import { useReadAllNotification } from "../hooks/useReadNotification";

function MarkAllRead() {
  return (
    <Modal>
      <Modal.Trigger>
        <Button variant="link" className="cursor-pointer text-xs md:text-sm">
          Mark all read
        </Button>
      </Modal.Trigger>

      <Modal.Content>
        <Content />
      </Modal.Content>
    </Modal>
  );
}

function Content() {
  const { close } = useModal();
  const { isPending, readAll } = useReadAllNotification();

  function handleClick() {
    readAll();
    close();
  }

  return (
    <section className="space-y-4 p-4 md:p-0">
      <div
        className={`bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl`}
      >
        <MailOpen size={22} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold">
          Mark Notifications as read?
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Are you sure you want to mark all your notifications as read
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="h-11 flex-1 cursor-pointer"
          onClick={close}
        >
          Close
        </Button>

        <Button className="h-11 flex-1 cursor-pointer" onClick={handleClick}>
          {isPending && <Loader2 className="animate-spin" />}
          Mark as read
        </Button>
      </div>
    </section>
  );
}

export default MarkAllRead;
