// ============================================================================
// TIVO NOTIFICATION CONTEXT — PHASE 18
// Gestion globale du centre de notifications, seuils d'alertes & dispatch
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TivoNotification, 
  NotificationPreferences, 
  WebPushStatus, 
  NotificationPriority 
} from '../notifications/notificationTypes';
import { 
  DEFAULT_NOTIFICATION_PREFERENCES,
  playNotificationSound,
  triggerHaptic,
  getWebPushStatus,
  requestWebPushPermission,
  sendWebPushNotification,
  generateSupervisorWhatsAppUrl,
  evaluateThresholds
} from '../notifications/notificationEngine';
import { useTransactions } from './TransactionContext';
import { useAudit } from './AuditContext';
import { useAgency } from './AgencyContext';

interface NotificationContextType {
  notifications: TivoNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  webPushStatus: WebPushStatus;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<TivoNotification, 'id' | 'timestamp' | 'read'>) => void;
  updatePreferences: (partial: Partial<NotificationPreferences>) => void;
  requestPush: () => Promise<boolean>;
  testNotification: (priority?: NotificationPriority) => void;
  sendWhatsAppAlert: (notification: TivoNotification) => void;
  checkThresholds: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_NOTIFS = 'tivo_notifications_v1';
const STORAGE_KEY_PREFS = 'tivo_notification_prefs_v1';

// Centre de notifications initial vierge pour la production réelle
const INITIAL_DEMO_NOTIFICATIONS: TivoNotification[] = [];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { networkBalances, cashBalance, debts } = useTransactions();
  const { anomalies } = useAudit();
  const { profile } = useAgency();

  // 1. Chargement des notifications stockées
  const [notifications, setNotifications] = useState<TivoNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading stored notifications:', e);
    }
    return INITIAL_DEMO_NOTIFICATIONS;
  });

  // 2. Chargement des préférences utilisateur
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading stored notification preferences:', e);
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  });

  // 3. Statut Push Web
  const [webPushStatus, setWebPushStatus] = useState<WebPushStatus>(getWebPushStatus());

  // Sauvegarde persistante des notifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to persist notifications:', e);
    }
  }, [notifications]);

  // Sauvegarde persistante des préférences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to persist notification preferences:', e);
    }
  }, [preferences]);

  // Nombre de notifications non lues
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Tout marquer comme lu
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Effacer tout l'historique
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Ajouter une notification dynamique
  const addNotification = useCallback((
    notif: Omit<TivoNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotif: TivoNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Feedback sonore et vibration si activés
    if (preferences.enableSound) {
      playNotificationSound(newNotif.priority);
    }
    if (preferences.enableVibration) {
      triggerHaptic(newNotif.priority);
    }

    // Push Web si activé
    if (preferences.enablePush && webPushStatus.permission === 'granted') {
      sendWebPushNotification(newNotif.title, {
        body: newNotif.message,
        tag: newNotif.id,
      });
    }

    setNotifications((prev) => [newNotif, ...prev]);
  }, [preferences, webPushStatus]);

  // Mise à jour des préférences
  const updatePreferences = useCallback((partial: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  // Demander la permission Push Web
  const requestPush = useCallback(async (): Promise<boolean> => {
    const granted = await requestWebPushPermission();
    setWebPushStatus(getWebPushStatus());
    if (granted) {
      updatePreferences({ enablePush: true });
      // Envoyer une notification de bienvenue/test
      sendWebPushNotification('Tivo POS Notifications', {
        body: 'Les alertes d’urgence et de seuil sont maintenant actives sur cet appareil.',
      });
    } else {
      updatePreferences({ enablePush: false });
    }
    return granted;
  }, [updatePreferences]);

  // Déclencheur manuel pour tester les alertes sonores et visuelles
  const testNotification = useCallback((priority: NotificationPriority = 'high') => {
    addNotification({
      type: 'general_info',
      priority,
      category: 'system',
      title: `Test d'alerte Tivo (${priority.toUpperCase()})`,
      message: 'Vérification du signal sonore synthétique, du retour haptique et de l’affichage visuel.',
    });
  }, [addNotification]);

  // Envoi WhatsApp vers le superviseur ou gérant
  const sendWhatsAppAlert = useCallback((notification: TivoNotification) => {
    const agencyName = profile?.agencyName || 'Kiosque Tivo';
    const targetPhone = preferences.supervisorPhone || profile?.phone || '+229 97 00 00 00';
    const url = generateSupervisorWhatsAppUrl(targetPhone, notification, agencyName);
    window.open(url, '_blank');
  }, [preferences.supervisorPhone, profile]);

  // Vérification périodique et dynamique des seuils
  const checkThresholds = useCallback(() => {
    const triggered = evaluateThresholds(
      networkBalances,
      cashBalance,
      debts,
      anomalies,
      preferences,
      notifications
    );

    if (triggered.length > 0) {
      // Déclencher le son pour l'alerte la plus haute
      const highestPriority = triggered.some((t) => t.priority === 'critical')
        ? 'critical'
        : triggered.some((t) => t.priority === 'high')
        ? 'high'
        : 'medium';

      if (preferences.enableSound) playNotificationSound(highestPriority);
      if (preferences.enableVibration) triggerHaptic(highestPriority);

      // Web Push
      if (preferences.enablePush && webPushStatus.permission === 'granted') {
        const top = triggered[0];
        sendWebPushNotification(top.title, { body: top.message, tag: top.id });
      }

      setNotifications((prev) => [...triggered, ...prev]);
    }
  }, [networkBalances, cashBalance, debts, anomalies, preferences, notifications, webPushStatus]);

  // Évaluation automatique des seuils lors de changements financiers
  useEffect(() => {
    const timer = setTimeout(() => {
      checkThresholds();
    }, 1200); // Débounce pour éviter les vérifications répétitives lors de saisies rapides
    return () => clearTimeout(timer);
  }, [networkBalances, cashBalance, debts.length, anomalies.length]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        webPushStatus,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        updatePreferences,
        requestPush,
        testNotification,
        sendWhatsAppAlert,
        checkThresholds,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
