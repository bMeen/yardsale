import {
  useState,
  cloneElement,
  type ReactNode,
  type MouseEvent,
  type ReactElement,
  type HTMLAttributes,
} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { ModalContext, useModal } from "./context";

function Modal({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(value);
    }

    onOpenChange?.(value);
  };

  const close = () => {
    setOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        open,
        setOpen,
        close,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

function ModalTrigger({
  children,
}: {
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}) {
  const { setOpen } = useModal();

  return cloneElement(children, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      setOpen(true);
    },
  });
}

function ModalContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen } = useModal();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`sm:max-w-106.25 ${className}`}>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;

export { Modal };
