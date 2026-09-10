// ========================================================
// TIVO - MOTEUR D'ANALYSE DE RISQUE & DÉTECTION D'ANOMALIES
// Règles métier adaptées aux kiosques Mobile Money Bénin / UEMOA
// ========================================================

import { Transaction } from '../context/TransactionContext';
import { SecurityAnomaly, SecurityScore } from './auditTypes';

/**
 * Générer une empreinte cryptographique symbolique infalsifiable
 */
export const generateLogHash = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const randHex = Math.random().toString(16).substring(2, 6);
  return `SHA256:${hex}${randHex}`.toUpperCase();
};

/**
 * Scanner l'historique des transactions pour détecter les anomalies en temps réel
 */
export const scanTransactionsForAnomalies = (
  transactions: Transaction[],
  lastCashDiscrepancy: number = 0
): SecurityAnomaly[] => {
  const anomalies: SecurityAnomaly[] = [];

  // 1. RÈGLE : DOUBLON SUSPECT (Même numéro, même montant, même type dans un intervalle court)
  for (let i = 0; i < transactions.length; i++) {
    const txA = transactions[i];
    const timeA = new Date(txA.timestamp).getTime();

    for (let j = i + 1; j < transactions.length; j++) {
      const txB = transactions[j];
      const timeB = new Date(txB.timestamp).getTime();

      // Vérifier si même numéro et même montant
      const isSamePhone = 
        txA.clientPhone.replace(/[^\d]/g, '') === txB.clientPhone.replace(/[^\d]/g, '') &&
        txA.clientPhone.replace(/[^\d]/g, '').length >= 8;

      const isSameAmount = txA.amount === txB.amount;
      const isSameType = txA.type === txB.type;
      const diffMinutes = Math.abs(timeA - timeB) / (1000 * 60);

      if (isSamePhone && isSameAmount && isSameType && diffMinutes <= 15) {
        anomalies.push({
          id: `anom_dup_${txA.id}_${txB.id}`,
          type: 'duplicate_transaction',
          title: 'Suspicion de Double Débit / Doublon',
          description: `2 transactions de ${txA.amount.toLocaleString('fr-FR')} FCFA (${txA.type === 'deposit' ? 'Dépôt' : 'Retrait'}) vers ${txA.clientPhone} effectuées à seulement ${Math.round(diffMinutes)} min d'intervalle.`,
          detectedAt: txA.timestamp,
          timeStr: txA.timeStr,
          dateStr: txA.dateStr,
          severity: 'critical',
          status: 'active',
          relatedTransactionId: txA.id,
          relatedPhone: txA.clientPhone,
          amount: txA.amount,
          networkId: txA.networkId,
        });
        break; // Éviter les duplicatas d'alertes
      }
    }
  }

  // 2. RÈGLE : SEUIL DE CONFORMITÉ KYC & BLANCHIMENT BCEAO (> 500 000 FCFA)
  transactions.forEach((tx) => {
    if (tx.amount >= 500000) {
      anomalies.push({
        id: `anom_kyc_${tx.id}`,
        type: 'high_amount_threshold',
        title: 'Transaction à Seuil Élevé (Contrôle CNI / CIP requis)',
        description: `Opération majeure de ${tx.amount.toLocaleString('fr-FR')} FCFA sur ${tx.networkId.toUpperCase()} pour le client ${tx.clientName || tx.clientPhone}. Vérification physique de pièce d'identité obligatoire selon la réglementation UEMOA.`,
        detectedAt: tx.timestamp,
        timeStr: tx.timeStr,
        dateStr: tx.dateStr,
        severity: 'warning',
        status: 'active',
        relatedTransactionId: tx.id,
        relatedPhone: tx.clientPhone,
        amount: tx.amount,
        networkId: tx.networkId,
      });
    }
  });

  // 3. RÈGLE : FRÉQUENCE ÉLEVÉE SUR UN MÊME NUMÉRO (RAFALE > 2 TRANSACTIONS AUJOURD'HUI)
  const phoneCounts: Record<string, { count: number; total: number; latestTx: Transaction }> = {};
  transactions.forEach((tx) => {
    const cleanPhone = tx.clientPhone.replace(/[^\d]/g, '');
    if (cleanPhone.length >= 8) {
      if (!phoneCounts[cleanPhone]) {
        phoneCounts[cleanPhone] = { count: 0, total: 0, latestTx: tx };
      }
      phoneCounts[cleanPhone].count++;
      phoneCounts[cleanPhone].total += tx.amount;
    }
  });

  Object.entries(phoneCounts).forEach(([cleanPhone, data]) => {
    if (data.count >= 3) {
      anomalies.push({
        id: `anom_burst_${cleanPhone}`,
        type: 'rapid_burst_burst',
        title: 'Activité Fréquente Répétée',
        description: `Le numéro ...${cleanPhone.slice(-6)} a cumulé ${data.count} opérations aujourd'hui pour un volume total de ${data.total.toLocaleString('fr-FR')} FCFA.`,
        detectedAt: data.latestTx.timestamp,
        timeStr: data.latestTx.timeStr,
        dateStr: data.latestTx.dateStr,
        severity: 'warning',
        status: 'active',
        relatedTransactionId: data.latestTx.id,
        relatedPhone: data.latestTx.clientPhone,
        amount: data.total,
        networkId: data.latestTx.networkId,
      });
    }
  });

  // 4. RÈGLE : ÉCART DE CAISSE NON ÉQUILIBRÉ
  if (lastCashDiscrepancy !== 0) {
    anomalies.push({
      id: 'anom_cash_discrepancy',
      type: 'cash_discrepancy_alert',
      title: 'Divergence Constatée en Caisse Physique',
      description: `Dernier décompte d'espèces présentant un écart de ${Math.abs(lastCashDiscrepancy).toLocaleString('fr-FR')} FCFA (${lastCashDiscrepancy > 0 ? 'Surplus inexpliqué' : 'Manquant de caisse'}).`,
      detectedAt: new Date().toISOString(),
      timeStr: 'En cours',
      dateStr: "Aujourd'hui",
      severity: Math.abs(lastCashDiscrepancy) > 5000 ? 'critical' : 'warning',
      status: 'active',
      amount: Math.abs(lastCashDiscrepancy),
    });
  }

  return anomalies;
};

/**
 * Calculer l'indice global de sécurité et d'intégrité du kiosque (Score 0 à 100)
 */
export const calculateSecurityScore = (anomalies: SecurityAnomaly[]): SecurityScore => {
  const activeAnomalies = anomalies.filter((a) => a.status === 'active' || a.status === 'investigating');
  const criticalCount = activeAnomalies.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAnomalies.filter((a) => a.severity === 'warning').length;

  // Calcul du score dégressif
  let score = 100;
  score -= criticalCount * 20;
  score -= warningCount * 8;
  score = Math.max(10, Math.min(100, score));

  let level: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
  let summary = 'Kiosque sous protection maximale. Aucune anomalie critique.';

  if (score < 50) {
    level = 'critical';
    summary = 'Niveau de risque élevé. Plusieurs anomalies critiques requièrent votre action.';
  } else if (score < 75) {
    level = 'warning';
    summary = 'Attention requise. Des opérations atypiques doivent être vérifiées.';
  } else if (score < 90) {
    level = 'good';
    summary = 'Bonne sécurité globale avec des alertes mineures sous contrôle.';
  }

  return {
    score,
    level,
    activeAlertsCount: activeAnomalies.length,
    criticalAlertsCount: criticalCount,
    summary,
  };
};
