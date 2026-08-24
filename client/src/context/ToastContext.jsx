import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-20 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-4 sm:mx-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lift',
              toast.type === 'error' && 'bg-danger',
              toast.type === 'info' && 'bg-forest',
              toast.type === 'warning' && 'bg-warn',
              toast.type !== 'error' && toast.type !== 'info' && toast.type !== 'warning' && 'bg-ok'
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
