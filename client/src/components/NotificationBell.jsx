import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiBell } from 'react-icons/hi';
import { useI18n } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { formatChatTime } from '../utils/helpers';
import { notificationCopy } from '../utils/notifications';
import { cn } from '../utils/cn';

export default function NotificationBell() {
  const { t } = useI18n();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const preview = notifications.slice(0, 6);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openItem = async (item) => {
    if (!item.read) await markRead(item.id);
    setOpen(false);
    navigate(item.href);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={cn(
          'relative grid size-9 place-items-center rounded-full border border-line/80 bg-paper/80 text-ink shadow-sm transition',
          'hover:border-forest/30 hover:bg-forest-light dark:border-white/10',
          open && 'border-forest/35 bg-forest-light'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t.a11y.openNotifications}
        onClick={() => setOpen((value) => !value)}
      >
        <HiBell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="surface absolute right-0 z-50 mt-2 w-[min(20.5rem,calc(100vw-2rem))] origin-top-right p-2 animate-fade-up"
        >
          <div className="mb-1 flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-ink">{t.notify.title}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-forest hover:underline"
                onClick={markAllRead}
              >
                {t.notify.markAll}
              </button>
            )}
          </div>

          {preview.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t.notify.empty}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {preview.map((item) => {
                const copy = notificationCopy(item, t);
                return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-forest-light/70',
                      !item.read && 'bg-forest-light/40'
                    )}
                    onClick={() => openItem(item)}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-forest">
                      {copy.kind}
                    </span>
                    <span className="font-semibold text-ink">{copy.title}</span>
                    <span className="text-xs text-muted">{copy.body}</span>
                    <span className="text-[11px] text-muted">{formatChatTime(item.createdAt)}</span>
                  </button>
                </li>
                );
              })}
            </ul>
          )}

          <Link
            to="/notifications"
            className="mt-1 block rounded-xl px-3 py-2 text-center text-sm font-semibold text-forest hover:bg-forest-light"
            onClick={() => setOpen(false)}
          >
            {t.notify.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}
