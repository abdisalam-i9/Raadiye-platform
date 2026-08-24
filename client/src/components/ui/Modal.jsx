import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Button from './Button';
import { useI18n } from '../../context/LanguageContext';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}) {
  const { t } = useI18n();
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
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-paper/95 p-6 shadow-lift backdrop-blur-xl sm:rounded-3xl"
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
            aria-label={t.a11y.close}
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
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
}) {
  const { t } = useI18n();
  const resolvedConfirm = confirmLabel || t.common.yes;
  const resolvedCancel = cancelLabel || t.common.dismiss;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {resolvedCancel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {resolvedConfirm}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
}
