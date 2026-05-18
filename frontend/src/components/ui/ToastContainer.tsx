import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import Toast from './Toast';

/**
 * ToastContainer - Container component that displays all active toasts.
 *
 * Renders toasts in a fixed position at the top-right of the viewport.
 * Toasts stack vertically with the newest at the bottom.
 *
 * Usage: Add this component once at the root level of your app (e.g., in App.tsx)
 * Then use useToastStore().success/error/warning/info() anywhere to show toasts.
 */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  // Don't render anything if there are no toasts
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
