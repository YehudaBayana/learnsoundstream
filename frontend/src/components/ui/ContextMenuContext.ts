import { createContext, useContext } from "react";

interface ContextMenuContextValue {
  close: () => void;
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export const useContextMenuContext = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("ContextMenu components must be used within ContextMenu");
  }
  return context;
};
