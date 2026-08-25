import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowUp } from 'react-icons/hi';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';
import { formatChatTime, getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

function otherParticipant(chat, userId) {
  return (chat?.participants || []).find((person) => String(person.id) !== String(userId));
}

function itemPath(chat) {
  return chat.itemKind === 'lost' ? `/lost-items/${chat.itemId}` : `/items/${chat.itemId}`;
}

export default function ChatRoom() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
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
  }, [id, navigate, showToast, t.chat.loadError]);

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
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{other?.name || t.chat.you}</p>
          <Link to={itemPath(chat)} className="block truncate text-xs text-white/80 hover:underline">
            {t.chat.about}: {chat.itemTitle}
          </Link>
        </div>
      </header>

      <div className="chat-wallpaper min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        {messages.length === 0 ? (
          <p className="mx-auto max-w-xs rounded-2xl bg-paper/90 px-4 py-3 text-center text-sm text-muted shadow-sm">
            {t.chat.noMessages}
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((message) => {
              const mine = String(message.senderId) === String(user?.id);
              return (
                <li key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
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
