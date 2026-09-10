import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AuditLogEntry, SecurityAnomaly, SecurityScore } from '../audit/auditTypes';
import { scanTransactionsForAnomalies, calculateSecurityScore, generateLogHash } from '../audit/fraudEngine';
import { useTransactions } from './TransactionContext';
import { useAgency } from './AgencyContext';

interface AuditContextType {
  logs: AuditLogEntry[];
  anomalies: SecurityAnomaly[];
  securityScore: SecurityScore;
  activeAnomaliesCount: number;
  addLog: (entry: {
    category: AuditLogEntry['category'];
    severity: AuditLogEntry['severity'];
    action: string;
    details: string;
    authorName?: string;
    authorRole?: string;
  }) => void;
  resolveAnomaly: (anomalyId: string, resolutionNote?: string) => void;
  dismissAnomaly: (anomalyId: string, reason?: string) => void;
  exportAuditCsv: () => void;
  resetAuditData: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Journal d'audit initial vierge pour la production réelle
const INITIAL_LOGS: AuditLogEntry[] = [];

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { transactions, cashAudits } = useTransactions();
  const { activeCashier } = useAgency();

  // Historique des logs d'audit immuables
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('tivo_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('tivo_audit_logs', JSON.stringify(logs));
  }, [logs]);

  // Dernier écart de caisse constaté
  const lastDiscrepancy = cashAudits.length > 0 ? cashAudits[0].discrepancy : 0;

  // Anomalies détectées automatiquement
  const [userAnomalies, setUserAnomalies] = useState<SecurityAnomaly[]>(() => {
    const saved = localStorage.getItem('tivo_security_anomalies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return scanTransactionsForAnomalies(transactions, lastDiscrepancy);
  });

  // Re-scanner à chaque changement de transactions ou d'audit de caisse
  useEffect(() => {
    const detected = scanTransactionsForAnomalies(transactions, lastDiscrepancy);
    setUserAnomalies((prev) => {
      // Préserver le statut des anomalies déjà résolues par l'utilisateur
      const resolvedIds = new Set(
        prev.filter((a) => a.status === 'resolved' || a.status === 'dismissed').map((a) => a.id)
      );

      return detected.map((d) => {
        if (resolvedIds.has(d.id)) {
          const old = prev.find((p) => p.id === d.id);
          return old || d;
        }
        return d;
      });
    });
  }, [transactions, lastDiscrepancy]);

  useEffect(() => {
    localStorage.setItem('tivo_security_anomalies', JSON.stringify(userAnomalies));
  }, [userAnomalies]);

  // Score de sécurité dynamique
  const securityScore = useMemo(() => {
    return calculateSecurityScore(userAnomalies);
  }, [userAnomalies]);

  const activeAnomaliesCount = useMemo(() => {
    return userAnomalies.filter((a) => a.status === 'active' || a.status === 'investigating').length;
  }, [userAnomalies]);

  // Enregistrer un événement dans le journal d'audit
  const addLog = (entry: {
    category: AuditLogEntry['category'];
    severity: AuditLogEntry['severity'];
    action: string;
    details: string;
    authorName?: string;
    authorRole?: string;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const authorName = entry.authorName || activeCashier?.name || 'Gérant Kiosque';
    const authorRole = entry.authorRole || (activeCashier?.role === 'admin' ? 'Propriétaire' : activeCashier?.role === 'caissier' ? 'Caissier' : 'Gérant');

    const newLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      timestamp: now.toISOString(),
      timeStr: `${hours}:${minutes}:${seconds}`,
      dateStr: "Aujourd'hui",
      category: entry.category,
      severity: entry.severity,
      action: entry.action,
      authorName,
      authorRole,
      details: entry.details,
      ipOrDevice: 'Terminal Mobile PWA',
      hashFingerprint: generateLogHash(entry.action + entry.details + now.toISOString()),
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // Marquer une anomalie comme résolue / conforme
  const resolveAnomaly = (anomalyId: string, resolutionNote?: string) => {
    const anomaly = userAnomalies.find((a) => a.id === anomalyId);
    const now = new Date();

    setUserAnomalies((prev) =>
      prev.map((a) => {
        if (a.id !== anomalyId) return a;
        return {
          ...a,
          status: 'resolved',
          resolutionNote: resolutionNote || 'Vérifié conforme et légitime par le gérant',
          resolvedBy: activeCashier?.name || 'Gérant',
          resolvedAt: now.toISOString(),
        };
      })
    );

    // Enregistrer l'action de résolution dans le journal d'audit
    addLog({
      category: 'security',
      severity: 'info',
      action: 'Alerte de sécurité résolue',
      details: `Anomalie "${anomaly?.title || anomalyId}" marquée résolue. Note: ${resolutionNote || 'Vérifié conforme'}.`,
    });
  };

  // Écarter une anomalie (fausse alerte)
  const dismissAnomaly = (anomalyId: string, reason?: string) => {
    const anomaly = userAnomalies.find((a) => a.id === anomalyId);

    setUserAnomalies((prev) =>
      prev.map((a) => {
        if (a.id !== anomalyId) return a;
        return {
          ...a,
          status: 'dismissed',
          resolutionNote: reason || 'Classée sans suite / Fausse alerte',
          resolvedBy: activeCashier?.name || 'Gérant',
          resolvedAt: new Date().toISOString(),
        };
      })
    );

    addLog({
      category: 'security',
      severity: 'info',
      action: 'Alerte écartée (Fausse alerte)',
      details: `Alerte "${anomaly?.title || anomalyId}" classée sans suite. Motif: ${reason || 'Faux positif'}.`,
    });
  };

  // Exporter le journal d'audit complet en CSV avec UTF-8 BOM
  const exportAuditCsv = () => {
    const headers = ['ID', 'Date', 'Heure', 'Catégorie', 'Sévérité', 'Action', 'Auteur', 'Rôle', 'Détails', 'Empreinte_Hash'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.dateStr}"`,
      `"${l.timeStr}"`,
      `"${l.category}"`,
      `"${l.severity.toUpperCase()}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.authorName.replace(/"/g, '""')}"`,
      `"${l.authorRole}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.hashFingerprint}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tivo_journal_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAuditData = () => {
    setLogs(INITIAL_LOGS);
    setUserAnomalies(scanTransactionsForAnomalies(transactions, lastDiscrepancy));
    localStorage.removeItem('tivo_audit_logs');
    localStorage.removeItem('tivo_security_anomalies');
  };

  return (
    <AuditContext.Provider
      value={{
        logs,
        anomalies: userAnomalies,
        securityScore,
        activeAnomaliesCount,
        addLog,
        resolveAnomaly,
        dismissAnomaly,
        exportAuditCsv,
        resetAuditData,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
