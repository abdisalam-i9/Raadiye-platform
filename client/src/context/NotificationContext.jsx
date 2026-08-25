import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useToast } from './ToastContext';
import { useI18n } from './LanguageContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await api.notifications.list();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      /* keep current list */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNew = ({ notification } = {}) => {
      if (!notification?.id) return;
      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current].slice(0, 50);
      });
      setUnreadCount((count) => count + (notification.read ? 0 : 1));
      showToast(t.notify.toast, 'info');
    };

    socket.on('new-notification', onNew);
    return () => socket.off('new-notification', onNew);
  }, [socket, showToast, t.notify.toast]);

  const markRead = useCallback(async (id) => {
    setNotifications((current) => {
      const target = current.find((item) => item.id === id);
      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return current.map((item) => (item.id === id ? { ...item, read: true } : item));
    });
    try {
      const data = await api.notifications.markRead(id);
      if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
    } catch {
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await api.notifications.markAllRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({ notifications, unreadCount, refresh, markRead, markAllRead }),
    [notifications, unreadCount, refresh, markRead, markAllRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
