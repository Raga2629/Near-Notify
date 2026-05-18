import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch on login
  useEffect(() => {
    if (!user) { setNotifications([]); return; }

    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {});

    // Connect socket and join personal room
    const socket = io('http://localhost:5000');
    socket.emit('join', user._id);

    // New chat notification
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    // New nearby post broadcast
    socket.on('new_nearby_post', (data) => {
      const notif = {
        _id: Date.now().toString(),
        title: data.title,
        message: data.message,
        type: 'new_post',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try { await api.put(`/notifications/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await api.put('/notifications/read-all'); } catch {}
  };

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
