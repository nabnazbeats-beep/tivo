// ========================================================
// TIVO - AUDIT TRAIL & SÉCURITÉ ANTI-FRAUDE (TYPES)
// Normes BCEAO / UEMOA de traçabilité et détection d'anomalies
// ========================================================

export type AuditCategory = 
  | 'transaction'   // Dépôts, retraits, annulations
  | 'closure'       // Scellement ou réouverture de journée
  | 'cash'          // Décomptes physiques, apports et dépenses caisse
  | 'fleet'         // Achat de flotte / UV réseaux
  | 'debt'          // Création ou remboursement d'avances clients
  | 'auth'          // Connexion, déconnexion, passage de main caissier
  | 'security'      // Alerte de fraude détectée, résolue ou rejetée
  | 'system';       // Sauvegarde, restauration, modification paramètres

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;        // ISO string
  timeStr: string;          // '14:32:10'
  dateStr: string;          // 'Aujourd\'hui' ou '09/09/2026'
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;           // 'Dépôt MoMo validé', 'Clôture journalière scellée', etc.
  authorName: string;       // 'Nazirou GBADAMASSI'
  authorRole: string;       // 'Admin' | 'Gérant' | 'Caissier'
  details: string;          // 'Montant: 50 000 FCFA | Client: +229 97 45 12 89 | Réf: tx_101'
  ipOrDevice?: string;      // 'Terminal Mobile (Chrome Android)'
  hashFingerprint: string;  // Empreinte symbolique infalsifiable (ex: 'SHA256:7f8a...b1e4')
}

export type AnomalyType = 
  | 'duplicate_transaction'     // Deux opérations de même montant vers le même numéro en < 10 min
  | 'high_amount_threshold'     // Montant > 500 000 FCFA (seuil KYC / blanchiment BCEAO)
  | 'rapid_burst_burst'         // Plus de 3 opérations rapprochées vers le même compte
  | 'cash_discrepancy_alert'    // Écart de caisse physique vs théorique non nul
  | 'off_hours_activity'        // Opération nocturne hors heures habituelles (23h - 05h)
  | 'insufficient_balance'      // Tentative de retrait refusée pour solde réseau insuffisant
  | 'unusual_large_withdrawal';  // Retrait massif inhabituel (> 300 000 FCFA)

export interface SecurityAnomaly {
  id: string;
  type: AnomalyType;
  title: string;
  description: string;
  detectedAt: string;
  timeStr: string;
  dateStr: string;
  severity: AuditSeverity;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  relatedTransactionId?: string;
  relatedPhone?: string;
  amount?: number;
  networkId?: string;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface SecurityScore {
  score: number;           // 0 à 100 (ex: 95)
  level: 'excellent' | 'good' | 'warning' | 'critical';
  activeAlertsCount: number;
  criticalAlertsCount: number;
  summary: string;
}
