import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { formatChatTime, getErrorMessage, getInitials } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function otherParticipant(chat, userId) {
  return (chat.participants || []).find((person) => String(person.id) !== String(userId));
}

export default function ChatInbox() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageTitle(t.meta.chats);

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.chats.list();
      setChats(data.chats || []);
    } catch (err) {
      setError(getErrorMessage(err, t.chat.loadError));
    } finally {
      setLoading(false);
    }
  }, [t.chat.loadError]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewMessage = ({ chatId, message }) => {
      setChats((current) => {
        const index = current.findIndex((chat) => chat.id === chatId);
        if (index === -1) return current;
        const next = [...current];
        next[index] = {
          ...next[index],
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
        };
        next.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        return next;
      });
    };

    socket.on('new-message', onNewMessage);
    return () => socket.off('new-message', onNewMessage);
  }, [socket]);

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader title={t.chat.title} description={t.chat.body} />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner label={t.common.loading} />
        </div>
      ) : error ? (
        <EmptyState
          title={t.chat.loadError}
          description={error}
          action={
            <Button type="button" onClick={loadChats}>
              {t.common.retry}
            </Button>
          }
        />
      ) : chats.length === 0 ? (
        <EmptyState
          title={t.chat.emptyTitle}
          description={t.chat.emptyBody}
          action={
            <Button as={Link} to="/items">
              {t.actions.browseItems}
            </Button>
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-[1.35rem] border border-line/80 bg-paper shadow-card">
          {chats.map((chat) => {
            const other = otherParticipant(chat, user?.id);
            return (
              <li key={chat.id} className="border-b border-line/70 last:border-b-0">
                <Link
                  to={`/chats/${chat.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-forest-light/50 sm:px-5"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-forest to-forest-dark text-xs font-bold text-white">
                    {getInitials(other?.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold text-ink">{other?.name || t.chat.you}</span>
                      <span className="shrink-0 text-xs text-muted">{formatChatTime(chat.lastMessageAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          chat.itemKind === 'lost'
                            ? 'bg-clay-light text-clay'
                            : 'bg-forest-light text-forest'
                        }`}
                      >
                        {chat.itemKind === 'lost' ? t.chat.itemLost : t.chat.itemFound}
                      </span>
                      <span className="truncate text-sm text-forest">{chat.itemTitle}</span>
                    </span>
                    <span className="mt-1 block truncate text-sm text-muted">
                      {chat.lastMessage || t.chat.noMessages}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
