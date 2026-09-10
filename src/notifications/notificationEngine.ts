// ============================================================================
// TIVO NOTIFICATION ENGINE — PHASE 18
// Moteur d'évaluation des seuils, Web Audio synthétisé, Haptic & Dispatch WhatsApp
// ============================================================================

import { 
  TivoNotification, 
  NotificationPreferences, 
  NotificationPriority 
} from './notificationTypes';
import { DebtRecord } from '../context/TransactionContext';
import { SecurityAnomaly } from '../audit/auditTypes';
import { formatFCFA } from '../design-system/tokens/typography';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableInApp: true,
  enablePush: false,
  enableSound: true,
  enableVibration: true,
  supervisorPhone: '+229 97 00 00 00',
  fleetMinThresholds: {
    mtn: 50000,
    moov: 40000,
    celtis: 30000,
    smt: 25000,
    other: 20000,
  },
  cashMinThreshold: 25000,
  cashMaxThreshold: 1000000,
  closureReminderTime: '20:30',
  autoAlertSupervisorOnCritical: true,
};

// ============================================================================
// 1. GESTION DU SON AUDIO PERSONNALISÉ & WEB AUDIO SYNTHESIZER
// ============================================================================
let audioCtx: AudioContext | null = null;

export const CUSTOM_SOUND_STORAGE_KEY = 'tivo_custom_notification_sound';
export const CUSTOM_SOUND_NAME_KEY = 'tivo_custom_notification_sound_name';

export const getCustomSoundName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CUSTOM_SOUND_NAME_KEY);
};

export const setCustomSoundData = (dataUrl: string, fileName: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_SOUND_STORAGE_KEY, dataUrl);
  localStorage.setItem(CUSTOM_SOUND_NAME_KEY, fileName);
};

export const clearCustomSound = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CUSTOM_SOUND_STORAGE_KEY);
  localStorage.removeItem(CUSTOM_SOUND_NAME_KEY);
};

/**
 * Synthétiseur Web Audio sans latence (utilisé en fallback ou par défaut)
 */
export const playSynthesizedWebAudio = (priority: NotificationPriority = 'medium'): void => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (priority === 'critical') {
      // Deux bips stridents distincts d'urgence
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (priority === 'high') {
      // Double carillon ambre
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Carillon doux subtil (info ou normal)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn('Unable to play notification sound via Web Audio:', err);
  }
};

/**
 * Joue le son de notification :
 * 1. Vérifie si l'utilisateur a importé un fichier audio personnalisé (Base64)
 * 2. Sinon, tente de jouer le fichier audio public /sounds/notification.mp3
 * 3. En cas d'absence de fichier ou d'erreur, bascule automatiquement sur le synthétiseur Web Audio
 */
export const playNotificationSound = (priority: NotificationPriority = 'medium'): void => {
  if (typeof window === 'undefined') return;

  // 1. Fichier audio personnalisé importé manuellement
  const storedSound = localStorage.getItem(CUSTOM_SOUND_STORAGE_KEY);
  if (storedSound) {
    try {
      const audio = new Audio(storedSound);
      audio.volume = 0.9;
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          playSynthesizedWebAudio(priority);
        });
      }
      return;
    } catch {
      playSynthesizedWebAudio(priority);
      return;
    }
  }

  // 2. Fichier audio public déposé dans /sounds/notification.mp3
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.9;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fichier non trouvé ou bloqué -> fallback synthétiseur
        playSynthesizedWebAudio(priority);
      });
      return;
    }
  } catch {
    playSynthesizedWebAudio(priority);
  }
};

// ============================================================================
// 2. RETOUR HAPTIQUE (Vibrations tactiles sur mobile)
// ============================================================================
export const triggerHaptic = (priority: NotificationPriority = 'medium'): void => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    if (priority === 'critical') {
      navigator.vibrate([150, 60, 150, 60, 250]);
    } else if (priority === 'high') {
      navigator.vibrate([100, 50, 100]);
    } else {
      navigator.vibrate(60);
    }
  } catch (err) {
    console.debug('Haptic vibration not supported or blocked:', err);
  }
};

// ============================================================================
// 3. API WEB PUSH NATIVE & SERVICE WORKER
// ============================================================================
export const getWebPushStatus = (): { supported: boolean; permission: NotificationPermission } => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'denied' };
  }
  return { supported: true, permission: Notification.permission };
};

export const requestWebPushPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.error('Error requesting push permission:', err);
    return false;
  }
};

export const sendWebPushNotification = async (
  title: string, 
  options?: NotificationOptions
): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          icon: '/logo-tivo.png',
          badge: '/logo-tivo.png',
          ...options,
        });
        return true;
      }
    }

    // Fallback notification native standard
    new Notification(title, {
      icon: '/logo-tivo.png',
      ...options,
    });
    return true;
  } catch (err) {
    console.error('Failed to trigger web notification:', err);
    return false;
  }
};

// ============================================================================
// 4. GÉNÉRATEUR D'ALERTES WHATSAPP SUPERVISEUR
// ============================================================================
export const generateSupervisorWhatsAppUrl = (
  supervisorPhone: string,
  notification: TivoNotification,
  agencyName: string = 'Agence Tivo'
): string => {
  const cleanPhone = supervisorPhone.replace(/[^0-9+]/g, '');
  const dateStr = new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const priorityBadge = {
    critical: '🔴 URGENT / CRITIQUE',
    high: '🟠 IMPORTANT',
    medium: '🔵 INFORMATION',
    low: '⚪ INFO',
  }[notification.priority];

  const textLines = [
    `🚨 *ALERTE TIVO — ${agencyName.toUpperCase()}*`,
    ``,
    `*Priorité :* ${priorityBadge}`,
    `*Objet :* ${notification.title}`,
    `*Détails :* ${notification.message}`,
    `*Heure de détection :* ${dateStr}`,
    ``,
    `_Action recommandée :_ Ouvrez Tivo ou effectuez le réapprovisionnement sans délai.`,
    `_Message généré automatiquement par Tivo POS._`,
  ];

  const fullText = textLines.join('\n');
  return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(fullText)}`;
};

// ============================================================================
// 5. MOTEUR D'ÉVALUATION DES SEUILS & DÉTECTION PROACTIVE
// ============================================================================
export const evaluateThresholds = (
  networkBalances: Record<string, number>,
  cashBalance: number,
  debts: DebtRecord[],
  anomalies: SecurityAnomaly[],
  prefs: NotificationPreferences,
  existingNotifications: TivoNotification[]
): TivoNotification[] => {
  const newNotifications: TivoNotification[] = [];
  const nowIso = new Date().toISOString();

  // Helper pour éviter les doublons récents (moins de 20 minutes)
  const isDuplicateRecent = (type: string, keyVal: string): boolean => {
    const twentyMinsAgo = Date.now() - 20 * 60 * 1000;
    return existingNotifications.some((n) => {
      if (n.type !== type) return false;
      const notifTime = new Date(n.timestamp).getTime();
      if (notifTime < twentyMinsAgo) return false;
      if (n.metadata?.networkId && n.metadata.networkId === keyVal) return true;
      if (n.metadata?.anomalyId && n.metadata.anomalyId === keyVal) return true;
      return false;
    });
  };

  // 1. Vérification des seuils de soldes flotte UV
  const networks: Array<{ id: 'mtn' | 'moov' | 'celtis' | 'smt'; name: string }> = [
    { id: 'mtn', name: 'MTN MoMo' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'celtis', name: 'Celtis Cash' },
    { id: 'smt', name: 'SMT' },
  ];

  networks.forEach(({ id, name }) => {
    const currentBal = networkBalances[id] ?? 0;
    const minThreshold = prefs.fleetMinThresholds[id] ?? 50000;

    if (currentBal < minThreshold && !isDuplicateRecent('threshold_fleet', id)) {
      const isVeryLow = currentBal < minThreshold * 0.4;
      newNotifications.push({
        id: `fleet-${id}-${Date.now()}`,
        type: 'threshold_fleet',
        priority: isVeryLow ? 'critical' : 'high',
        category: 'balance',
        title: `Solde ${name} bas (${formatFCFA(currentBal)})`,
        message: `Le solde UV disponible est tombé sous le seuil configuré de ${formatFCFA(minThreshold)}. Risque d'interruption des retraits clients.`,
        timestamp: nowIso,
        read: false,
        metadata: {
          networkId: id,
          amount: currentBal,
          threshold: minThreshold,
          actionRoute: 'networks',
        },
        actions: [
          {
            id: 'recharge',
            label: 'Acheter de la flotte',
            type: 'recharge',
            payload: id,
          },
          {
            id: 'wa-supervisor',
            label: 'Alerter superviseur',
            type: 'whatsapp',
          },
        ],
      });
    }
  });

  // 2. Vérification du fond de caisse physique
  if (cashBalance < prefs.cashMinThreshold && !isDuplicateRecent('threshold_cash_low', 'cash_low')) {
    newNotifications.push({
      id: `cash-low-${Date.now()}`,
      type: 'threshold_cash_low',
      priority: 'high',
      category: 'balance',
      title: `Fond de caisse physique bas (${formatFCFA(cashBalance)})`,
      message: `La caisse physique est inférieure à votre seuil d'alerte de ${formatFCFA(prefs.cashMinThreshold)}. Les retraits en espèces risquent d'être bloqués.`,
      timestamp: nowIso,
      read: false,
      metadata: {
        amount: cashBalance,
        threshold: prefs.cashMinThreshold,
        actionRoute: 'cash',
      },
      actions: [
        {
          id: 'go-cash',
          label: 'Gérer la caisse',
          type: 'navigate',
          payload: 'cash',
        },
      ],
    });
  } else if (cashBalance > prefs.cashMaxThreshold && !isDuplicateRecent('threshold_cash_high', 'cash_high')) {
    newNotifications.push({
      id: `cash-high-${Date.now()}`,
      type: 'threshold_cash_high',
      priority: 'high',
      category: 'balance',
      title: `Excès d'espèces en caisse (${formatFCFA(cashBalance)})`,
      message: `Votre encaisse dépasse le plafond prudentiel de ${formatFCFA(prefs.cashMaxThreshold)}. Il est recommandé d'acheter de la flotte UV ou d'effectuer un dépôt bancaire.`,
      timestamp: nowIso,
      read: false,
      metadata: {
        amount: cashBalance,
        threshold: prefs.cashMaxThreshold,
        actionRoute: 'cash',
      },
      actions: [
        {
          id: 'go-cash',
          label: 'Recompter caisse',
          type: 'navigate',
          payload: 'cash',
        },
      ],
    });
  }

  // 3. Détection des créances clients échues (non remboursées)
  const overdueDebts = debts.filter(
    (d) => (d.status === 'unpaid' || d.status === 'partial') && d.dueDate && new Date(d.dueDate).getTime() < Date.now()
  );
  if (overdueDebts.length > 0 && !isDuplicateRecent('debt_overdue', 'debts_overdue')) {
    const totalOverdue = overdueDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    newNotifications.push({
      id: `debt-overdue-${Date.now()}`,
      type: 'debt_overdue',
      priority: 'medium',
      category: 'debt',
      title: `${overdueDebts.length} avance${overdueDebts.length > 1 ? 's' : ''} échue${overdueDebts.length > 1 ? 's' : ''} (${formatFCFA(totalOverdue)})`,
      message: `Des clients ont dépassé la date convenue de remboursement de leur avance. Relancez-les par WhatsApp.`,
      timestamp: nowIso,
      read: false,
      metadata: {
        amount: totalOverdue,
        actionRoute: 'debts',
      },
      actions: [
        {
          id: 'go-debts',
          label: 'Voir les créances',
          type: 'navigate',
          payload: 'debts',
        },
      ],
    });
  }

  // 4. Détection des alertes de sécurité critiques actives
  const criticalAnomalies = anomalies.filter((a) => a.status === 'active' && a.severity === 'critical');
  criticalAnomalies.forEach((anomaly) => {
    if (!isDuplicateRecent('security_alert', anomaly.id)) {
      newNotifications.push({
        id: `sec-${anomaly.id}-${Date.now()}`,
        type: 'security_alert',
        priority: 'critical',
        category: 'security',
        title: `Alerte sécurité : ${anomaly.title}`,
        message: anomaly.description,
        timestamp: nowIso,
        read: false,
        metadata: {
          anomalyId: anomaly.id,
          amount: anomaly.amount,
          clientPhone: anomaly.relatedPhone,
          actionRoute: 'audit',
        },
        actions: [
          {
            id: 'go-audit',
            label: 'Examiner l’alerte',
            type: 'navigate',
            payload: 'audit',
          },
          {
            id: 'wa-supervisor',
            label: 'Transférer au gérant',
            type: 'whatsapp',
          },
        ],
      });
    }
  });

  return newNotifications;
};
