import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastStoreState {
  toasts: Toast[];
  addToast: (message: string, variant: ToastVariant, action?: ToastAction) => string;
  success: (message: string, action?: ToastAction) => string;
  error: (message: string, action?: ToastAction) => string;
  warning: (message: string, action?: ToastAction) => string;
  info: (message: string, action?: ToastAction) => string;
  removeToast: (id: string) => void;
}

let nextToastId = 0;

export const useToastStore = create<ToastStoreState>((set) => {
  const addToast = (message: string, variant: ToastVariant, action?: ToastAction): string => {
    const id = `toast-${++nextToastId}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, action }] }));
    return id;
  };

  return {
    toasts: [],
    addToast,
    success: (message, action) => addToast(message, "success", action),
    error: (message, action) => addToast(message, "error", action),
    warning: (message, action) => addToast(message, "warning", action),
    info: (message, action) => addToast(message, "info", action),
    removeToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  };
});
