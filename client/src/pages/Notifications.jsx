import { Link } from 'react-router-dom';
import { useI18n } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { formatChatTime } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import { cn } from '../utils/cn';

export default function Notifications() {
  const { t } = useI18n();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  usePageTitle(t.meta.notifications);

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        title={t.notify.title}
        description={t.notify.body}
        action={
          unreadCount > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={markAllRead}>
              {t.notify.markAll}
            </Button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title={t.notify.empty} description={t.notify.emptyBody} />
      ) : (
        <ul className="overflow-hidden rounded-[1.35rem] border border-line/80 bg-paper shadow-card">
          {notifications.map((item) => (
            <li key={item.id} className="border-b border-line/70 last:border-b-0">
              <Link
                to={item.href}
                onClick={() => {
                  if (!item.read) markRead(item.id);
                }}
                className={cn(
                  'flex flex-col gap-1 px-4 py-4 transition hover:bg-forest-light/50 sm:px-5',
                  !item.read && 'bg-forest-light/30'
                )}
              >
                <span className="font-semibold text-ink">{item.matchedTitle}</span>
                <span className="text-sm text-muted">
                  {t.notify.forItem}: {item.sourceTitle}
                </span>
                <span className="text-xs text-muted">{formatChatTime(item.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
