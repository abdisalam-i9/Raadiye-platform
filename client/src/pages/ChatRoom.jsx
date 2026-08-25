import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowUp, HiOutlineShieldCheck } from 'react-icons/hi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import { formatChatDay, formatChatTime, getErrorMessage, getInitials } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

function otherParticipant(chat, userId) {
  return (chat?.participants || []).find((person) => String(person.id) !== String(userId));
}

function itemPath(chat) {
  return chat.itemKind === 'lost' ? `/lost-items/${chat.itemId}` : `/items/${chat.itemId}`;
}

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toDateString();
}

export default function ChatRoom() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const other = useMemo(() => otherParticipant(chat, user?.id), [chat, user?.id]);
  usePageTitle(other?.name ? `${other.name} ${t.meta.itemSuffix}` : t.meta.chat);

  const appendMessage = useCallback((message) => {
    if (!message?.id) return;
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, message];
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadChat() {
      setLoading(true);
      try {
        const data = await api.chats.getById(id);
        if (cancelled) return;
        setChat(data.chat);
        setMessages(data.chat?.messages || []);
        refreshNotifications();
      } catch (err) {
        if (!cancelled) {
          showToast(getErrorMessage(err, t.chat.loadError), 'error');
          navigate('/chats', { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChat();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, showToast, t.chat.loadError, refreshNotifications]);

  useEffect(() => {
    if (!socket || !id) return undefined;
    socket.emit('join-chat', id);

    const onNewMessage = (payload) => {
      if (payload?.chatId !== id || !payload.message) return;
      appendMessage(payload.message);
    };
    const onError = (payload) => {
      if (payload?.message) showToast(payload.message, 'error');
    };

    socket.on('new-message', onNewMessage);
    socket.on('chat-error', onError);

    return () => {
      socket.emit('leave-chat', id);
      socket.off('new-message', onNewMessage);
      socket.off('chat-error', onError);
    };
  }, [socket, id, appendMessage, showToast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const nextText = text.trim();
    if (!nextText || sending) return;

    setSending(true);
    try {
      if (socket?.connected) {
        socket.emit('send-message', { chatId: id, text: nextText });
      } else {
        const data = await api.chats.sendMessage(id, nextText);
        appendMessage(data.message);
      }
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      showToast(getErrorMessage(err, t.chat.error), 'error');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  if (loading || !chat) {
    return (
      <div className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center">
        <LoadingSpinner label={t.common.loading} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-3xl flex-col bg-[#efeae2] dark:bg-[#0f1a16]">
      <header className="flex items-center gap-3 border-b border-black/10 bg-forest px-3 py-3 text-white shadow-sm">
        <Link
          to="/chats"
          className="grid size-10 place-items-center rounded-full hover:bg-white/10"
          aria-label={t.chat.title}
        >
          <HiArrowLeft className="size-5" />
        </Link>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-bold">
          {getInitials(other?.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{other?.name || t.chat.you}</p>
          <Link to={itemPath(chat)} className="mt-0.5 inline-flex max-w-full items-center gap-1.5">
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                chat.itemKind === 'lost' ? 'bg-white/15 text-white' : 'bg-white text-forest'
              )}
            >
              {chat.itemKind === 'lost' ? t.chat.itemLost : t.chat.itemFound}
            </span>
            <span className="truncate text-xs text-white/80 hover:underline">{chat.itemTitle}</span>
          </Link>
        </div>
      </header>

      <div className="chat-wallpaper min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        <p className="mx-auto mb-4 flex max-w-md items-start gap-2 rounded-2xl bg-paper/95 px-3 py-2.5 text-xs leading-5 text-ink-soft shadow-sm">
          <HiOutlineShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" />
          {t.chat.safety}
        </p>

        {messages.length === 0 ? (
          <p className="mx-auto max-w-xs rounded-2xl bg-paper/90 px-4 py-3 text-center text-sm text-muted shadow-sm">
            {t.chat.noMessages}
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((message, index) => {
              const mine = String(message.senderId) === String(user?.id);
              const showDay = index === 0 || dayKey(messages[index - 1].createdAt) !== dayKey(message.createdAt);
              return (
                <li key={message.id}>
                  {showDay && (
                    <p className="mb-3 mt-4 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                      <span className="rounded-full bg-paper/90 px-3 py-1 shadow-sm">
                        {formatChatDay(message.createdAt)}
                      </span>
                    </p>
                  )}
                  <div className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                    {!mine && (
                      <span className="mb-1 grid size-7 shrink-0 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">
                        {getInitials(message.senderName || other?.name)}
                      </span>
                    )}
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3 py-2 shadow-sm',
                        mine
                          ? 'rounded-br-md bg-forest text-white'
                          : 'rounded-bl-md bg-paper text-ink'
                      )}
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[11px] font-semibold text-forest">{message.senderName}</p>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                      <p className={cn('mt-1 text-right text-[10px]', mine ? 'text-white/70' : 'text-muted')}>
                        {formatChatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-end gap-2 border-t border-black/10 bg-paper px-3 py-3"
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder={t.chat.placeholder}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-forest"
        />
        <Button type="submit" size="sm" className="size-11 shrink-0 rounded-full !px-0" disabled={!text.trim()} loading={sending}>
          <HiArrowUp className="size-5" />
          <span className="sr-only">{t.chat.send}</span>
        </Button>
      </form>
    </div>
  );
}
