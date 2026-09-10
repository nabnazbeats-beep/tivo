import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'debt' | 'cash_movement' | 'recharge';
  action: string;
  timestamp: string;
  summary: string;
  data?: any;
}

interface NetworkContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingSyncCount: number;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncTime: string;
  syncNow: () => Promise<{ success: boolean; syncedCount: number }>;
  addToSyncQueue: (item: { type: SyncQueueItem['type']; action: string; summary: string; data?: any }) => void;
  clearSyncQueue: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Détection réelle du statut navigateur
  const [realIsOnline, setRealIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Simulation manuelle (idéale pour les démos & tests de kiosque en zone blanche)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem('tivo_simulated_offline') === 'true';
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // File d'attente des opérations hors-ligne en attente de synchronisation cloud
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    const saved = localStorage.getItem('tivo_sync_queue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erreur parsing tivo_sync_queue', e);
      }
    }
    return [];
  });

  // Sauvegarde persistante de la file
  useEffect(() => {
    localStorage.setItem('tivo_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Statut effectif : si simulation active -> offline, sinon dépend du navigateur
  const isOnline = isSimulatedOffline ? false : realIsOnline;

  // Écouteurs natifs 'online' et 'offline'
  useEffect(() => {
    const handleOnline = () => setRealIsOnline(true);
    const handleOffline = () => setRealIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronisation des données en file d'attente
  const syncNow = useCallback(async () => {
    if (syncQueue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    setIsSyncing(true);

    // Simulation de round-trip réseau réaliste vers le serveur cloud Tivo
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const syncedCount = syncQueue.length;
    setSyncQueue([]);
    setIsSyncing(false);

    const now = new Date();
    setLastSyncTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    return { success: true, syncedCount };
  }, [syncQueue]);

  // Auto-synchronisation dès que la connexion est rétablie
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing) {
      syncNow();
    }
  }, [isOnline, syncQueue.length, isSyncing, syncNow]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem('tivo_simulated_offline', String(next));
      return next;
    });
  };

  const addToSyncQueue = ({
    type,
    action,
    summary,
    data,
  }: {
    type: SyncQueueItem['type'];
    action: string;
    summary: string;
    data?: any;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const newItem: SyncQueueItem = {
      id: 'sync_' + Date.now(),
      type,
      action,
      summary,
      timestamp: `${hours}:${minutes}`,
      data,
    };

    setSyncQueue((prev) => [newItem, ...prev]);
  };

  const clearSyncQueue = () => {
    setSyncQueue([]);
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        pendingSyncCount: syncQueue.length,
        syncQueue,
        isSyncing,
        lastSyncTime,
        syncNow,
        addToSyncQueue,
        clearSyncQueue,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
