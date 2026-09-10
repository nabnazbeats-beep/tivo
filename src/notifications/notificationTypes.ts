// ============================================================================
// TIVO NOTIFICATION TYPES — PHASE 18
// Centre de Notifications, Alertes Seuil, Push Web & Dispatch WhatsApp / SMS
// ============================================================================

export type NotificationType =
  | 'threshold_fleet'      // Solde flotte UV d'un réseau sous le seuil d'alerte
  | 'threshold_cash_low'   // Fond de caisse physique trop bas
  | 'threshold_cash_high'  // Excès d'espèces en caisse physique (risque de sécurité)
  | 'security_alert'       // Double débit, fraude, alerte AML > 500k BCEAO
  | 'closure_reminder'     // Rappel de clôture journalière obligatoire
  | 'debt_overdue'         // Avance / crédit client arrivé à échéance non remboursé
  | 'system_sync'          // Synchronisation hors-ligne ou sauvegarde de la base
  | 'general_info';        // Information ou mise à jour de l'application

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationCategory = 'balance' | 'security' | 'closure' | 'debt' | 'system';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'navigate' | 'whatsapp' | 'dismiss' | 'recharge';
  payload?: string; // Route ID or target URL
}

export interface TivoNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  read: boolean;
  metadata?: {
    networkId?: string;
    amount?: number;
    threshold?: number;
    clientPhone?: string;
    clientName?: string;
    anomalyId?: string;
    actionRoute?: string;
  };
  actions?: NotificationAction[];
}

export interface NotificationPreferences {
  enableInApp: boolean;
  enablePush: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  supervisorPhone: string; // Numéro WhatsApp/SMS du superviseur ou propriétaire (ex: +229 97 00 00 00)
  fleetMinThresholds: {
    mtn: number;
    moov: number;
    celtis: number;
    smt: number;
    other: number;
  };
  cashMinThreshold: number; // Ex: 25 000 FCFA
  cashMaxThreshold: number; // Ex: 1 000 000 FCFA
  closureReminderTime: string; // Format "HH:mm" ex: "20:30"
  autoAlertSupervisorOnCritical: boolean; // Proposer le dispatch WhatsApp direct si seuil critique
}

export interface WebPushStatus {
  supported: boolean;
  permission: NotificationPermission; // 'default' | 'granted' | 'denied'
}
