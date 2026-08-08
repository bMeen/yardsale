import { createContext, useContext } from "react";

type ModalContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal components must be used inside <Modal />");
  }

  return context;
}
