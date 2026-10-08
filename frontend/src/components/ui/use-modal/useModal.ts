import { useState, useCallback } from "react";

/**
 * Modal state returned by useModal hook.
 */
export interface ModalState {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle the modal open/closed state */
  toggle: () => void;
  /** Set the modal open state directly */
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * useModal - Hook for managing modal open/close state.
 *
 * Provides a simple, reusable way to manage modal visibility
 * with open, close, and toggle functions.
 *
 * Usage:
 *   const modal = useModal();
 *
 *   return (
 *     <>
 *       <Button onClick={modal.open}>Open Modal</Button>
 *       <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *         <Modal.Header>Title</Modal.Header>
 *         <Modal.Body>Content</Modal.Body>
 *       </Modal>
 *     </>
 *   );
 *
 * With initial state:
 *   const modal = useModal(true); // Opens modal by default
 *
 * Destructured:
 *   const { isOpen, open, close, toggle } = useModal();
 */
export function useModal(initialState: boolean = false): ModalState {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

export default useModal;
