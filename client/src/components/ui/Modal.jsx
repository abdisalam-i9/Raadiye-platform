import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Button from './Button';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-paper p-6 shadow-lift sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2 id="modal-title" className="font-display text-xl text-ink">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-cream hover:text-ink"
            aria-label="Xir"
          >
            <HiX className="size-5" />
          </button>
        </div>
        <div className="text-sm leading-6 text-ink-soft">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Haa',
  cancelLabel = 'Ka noqo',
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
}
