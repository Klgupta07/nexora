import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (item: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<NotificationItem, 'id'>) => {
      const id = `notif_${Date.now()}_${Math.random()}`;
      const newNotif: NotificationItem = { id, type, title, message, duration };
      setNotifications(prev => [...prev, newNotif]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-slide-in ${
              n.type === 'success'
                ? 'bg-dark-card/95 border-emerald-500/30 text-emerald-300'
                : n.type === 'error'
                ? 'bg-dark-card/95 border-rose-500/30 text-rose-300'
                : n.type === 'warning'
                ? 'bg-dark-card/95 border-amber-500/30 text-amber-300'
                : 'bg-dark-card/95 border-accent/30 text-cyan-300'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {n.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white">{n.title}</div>
              {n.message && <div className="text-xs text-gray-300 mt-0.5 leading-relaxed">{n.message}</div>}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

