import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when modal should close or cancel */
  onClose: () => void;
  /** Called when confirm button is clicked */
  onConfirm: () => void;
  /** Modal title */
  title: string;
  /** Modal description */
  description: string;
  /** Label for confirm button */
  confirmLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  /** Whether the action is destructive (danger style) */
  isDanger?: boolean;
  /** Whether the action is loading */
  isLoading?: boolean;
}

/**
 * ConfirmationModal - A generic modal for confirming actions.
 * 
 * Usage:
 *   <ConfirmationModal
 *     isOpen={isOpen}
 *     onClose={onClose}
 *     onConfirm={handleDelete}
 *     title="Delete Playlist"
 *     description="Are you sure you want to delete this playlist? This action cannot be undone."
 *     confirmLabel="Delete"
 *     isDanger
 *   />
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Header onClose={onClose}>
        {title}
      </Modal.Header>
      
      <Modal.Body>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="ghost" 
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm}
          variant={isDanger ? 'danger' : 'primary'}
          loading={isLoading}
        >
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
