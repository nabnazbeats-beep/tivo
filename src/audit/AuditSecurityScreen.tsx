import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Search, 
  Download, 
  User, 
  Lock, 
  RotateCcw, 
  Phone, 
  Check, 
  X,
  Info
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { AuditCategory, AuditSeverity, SecurityAnomaly } from './auditTypes';

interface AuditSecurityScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const AuditSecurityScreen: React.FC<AuditSecurityScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  const { 
    logs, 
    anomalies, 
    securityScore, 
    activeAnomaliesCount, 
    resolveAnomaly, 
    dismissAnomaly, 
    exportAuditCsv,
    resetAuditData
  } = useAudit();

  // Navigation interne : 'anomalies' | 'trail'
  const [activeSubTab, setActiveSubTab] = useState<'anomalies' | 'trail'>('anomalies');

  // Filtres anomalies
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'active' | 'resolved'>('active');

  // Filtres journal d'audit
  const [logSearch, setLogSearch] = useState<string>('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [logSeverityFilter, setLogSeverityFilter] = useState<AuditSeverity | 'all'>('all');

  // Modale de résolution d'anomalie
  const [resolvingAnomaly, setResolvingAnomaly] = useState<SecurityAnomaly | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('Vérifié conforme et légitime avec le client');

  // Anomalies filtrées
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (anomalyFilter === 'active') return a.status === 'active' || a.status === 'investigating';
      if (anomalyFilter === 'resolved') return a.status === 'resolved' || a.status === 'dismissed';
      return true;
    });
  }, [anomalies, anomalyFilter]);

  // Logs d'audit filtrés
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (logCategoryFilter !== 'all' && log.category !== logCategoryFilter) return false;
      if (logSeverityFilter !== 'all' && log.severity !== logSeverityFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase().trim();
        return (
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.authorName.toLowerCase().includes(q) ||
          log.hashFingerprint.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, logCategoryFilter, logSeverityFilter, logSearch]);

  const handleConfirmResolution = () => {
    if (!resolvingAnomaly) return;
    resolveAnomaly(resolvingAnomaly.id, resolutionNote);
    onShowToast?.('success', 'Alerte résolue avec succès', 'L’action a été enregistrée dans le journal d’audit.');
    setResolvingAnomaly(null);
  };

  const handleDismiss = (anomaly: SecurityAnomaly) => {
    dismissAnomaly(anomaly.id, 'Fausse alerte classée sans suite par le gérant');
    onShowToast?.('info', 'Alerte écartée', 'Considérée comme fausse alerte.');
  };

  const handleExportCsv = () => {
    exportAuditCsv();
    onShowToast?.('success', 'Export réussi', 'Le journal d’audit a été téléchargé en CSV UTF-8.');
  };

  // Couleurs et badges du score de sécurité
  const scoreColors = {
    excellent: {
      border: 'border-emerald-500/30',
      bg: 'from-emerald-500/15 via-teal-500/10 to-transparent',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    },
    good: {
      border: 'border-blue-500/30',
      bg: 'from-blue-500/15 via-cyan-500/10 to-transparent',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'from-amber-500/15 via-orange-500/10 to-transparent',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    critical: {
      border: 'border-rose-500/30',
      bg: 'from-rose-500/15 via-red-500/10 to-transparent',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
    },
  }[securityScore.level];

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER DU CENTRE DE SÉCURITÉ */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-6 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Barre du haut */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              aria-label="Retour"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <Lock className="w-3.5 h-3.5 text-cyan-300" />
              <span>Conformité BCEAO / UEMOA</span>
            </div>
          </div>

          <div className="relative z-10 text-center mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-100/90 block mb-1">
              Surveillance Kiosque & Intégrité
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Sécurité & Audit Trail</span>
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            </h1>
            <p className="text-xs text-blue-100 mt-1 max-w-sm mx-auto">
              Détection prédictive de fraudes et journal des événements horodatés et infalsifiables.
            </p>
          </div>

          {/* Sélecteur d'onglets interne (Alertes Anti-Fraude / Journal d'Audit) */}
          <div className="relative z-10 flex p-1 bg-black/20 backdrop-blur-md rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveSubTab('anomalies')}
              className={`flex-1 py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-2 transition-all truncate ${
                activeSubTab === 'anomalies'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Anti-Fraude</span>
              {activeAnomaliesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0">
                  {activeAnomaliesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('trail')}
              className={`flex-1 py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 sm:gap-2 transition-all truncate ${
                activeSubTab === 'trail'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Journal ({logs.length})</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CORPS PRINCIPAL */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">
          
          {/* CARTE SCORE DE SÉCURITÉ DU KIOSQUE */}
          <section className={`p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r ${scoreColors.bg} border ${scoreColors.border} shadow-sm flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                {securityScore.level === 'critical' ? (
                  <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500" />
                ) : securityScore.level === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                    Indice d'Intégrité
                  </h2>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase shrink-0 ${scoreColors.badge}`}>
                    {securityScore.level}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {securityScore.summary}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <span className={`text-xl sm:text-2xl md:text-3xl font-black ${scoreColors.text} block tracking-tight font-mono`}>
                {securityScore.score}<span className="text-xs font-bold text-slate-400">/100</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block truncate">
                {activeAnomaliesCount} active{activeAnomaliesCount > 1 ? 's' : ''}
              </span>
            </div>
          </section>

          {/* ======================================================== */}
          {/* ONGLET 1 : DÉTECTEUR DE FRAUDES & ALERTES */}
          {/* ======================================================== */}
          {activeSubTab === 'anomalies' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              
              {/* Filtres d'état des anomalies */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl">
                  <button
                    onClick={() => setAnomalyFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      anomalyFilter === 'active'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    À traiter ({anomalies.filter((a) => a.status === 'active').length})
                  </button>
                  <button
                    onClick={() => setAnomalyFilter('resolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      anomalyFilter === 'resolved'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Résolues ({anomalies.filter((a) => a.status === 'resolved' || a.status === 'dismissed').length})
                  </button>
                  <button
                    onClick={() => setAnomalyFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      anomalyFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Toutes ({anomalies.length})
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-slate-400">
                  Temps réel
                </span>
              </div>

              {/* LISTE DES ANOMALIES */}
              {filteredAnomalies.length > 0 ? (
                <div className="space-y-3">
                  {filteredAnomalies.map((anomaly) => {
                    const isCritical = anomaly.severity === 'critical';
                    const isResolved = anomaly.status === 'resolved';
                    const isDismissed = anomaly.status === 'dismissed';

                    return (
                      <div
                        key={anomaly.id}
                        className={`p-4 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${
                          isResolved || isDismissed
                            ? 'border-slate-200/60 dark:border-slate-800 opacity-75'
                            : isCritical
                            ? 'border-rose-500/40 ring-1 ring-rose-500/10'
                            : 'border-amber-500/40 ring-1 ring-amber-500/10'
                        }`}
                      >
                        {/* En-tête de la carte */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isResolved
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : isCritical
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}>
                              {isResolved ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isCritical ? (
                                <ShieldAlert className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {anomaly.title}
                              </h3>
                              <span className="text-[10px] text-slate-400">
                                {anomaly.dateStr} à {anomaly.timeStr}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isResolved
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : isDismissed
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              : isCritical
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {isResolved ? 'Résolu' : isDismissed ? 'Écarté' : isCritical ? 'Critique' : 'Attention'}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {anomaly.description}
                        </p>

                        {/* Métadonnées associées */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
                          {anomaly.amount && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-slate-200">
                              {formatFCFA(anomaly.amount)}
                            </span>
                          )}
                          {anomaly.relatedPhone && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {anomaly.relatedPhone}
                            </span>
                          )}
                          {anomaly.networkId && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                              {anomaly.networkId}
                            </span>
                          )}
                        </div>

                        {/* Note de résolution si résolu */}
                        {anomaly.resolutionNote && (
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 mb-3">
                            <strong>Note :</strong> {anomaly.resolutionNote} {anomaly.resolvedBy && `(par ${anomaly.resolvedBy})`}
                          </div>
                        )}

                        {/* Boutons d'action sur l'anomalie */}
                        {!isResolved && !isDismissed && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => setResolvingAnomaly(anomaly)}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Vérifier & Valider</span>
                            </button>
                            <button
                              onClick={() => handleDismiss(anomaly)}
                              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Fausse alerte</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Aucune alerte dans cette vue
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Toutes les opérations récentes respectent les seuils d'intégrité opérationnelle et réglementaire.
                  </p>
                </div>
              )}

              {/* Note d'information réglementaire BCEAO / CENTIF */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/70 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Directive Lutte Anti-Blanchiment (LBC/FT)</span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-300">
                    Les règles de surveillance Tivo s'alignent sur les seuils d'alerte de la BCEAO et de la CENTIF Bénin pour protéger le point de vente contre les escroqueries par faux SMS et les débits non autorisés.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 2 : JOURNAL D'AUDIT IMMUABLE (AUDIT TRAIL) */}
          {/* ======================================================== */}
          {activeSubTab === 'trail' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              
              {/* Barre de recherche et filtres */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Rechercher action, auteur, hash SHA-256..."
                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtres par Catégorie */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {(['all', 'transaction', 'cash', 'closure', 'security', 'debt', 'fleet'] as const).map((cat) => {
                    const isSelected = logCategoryFilter === cat;
                    const labels: Record<string, string> = {
                      all: 'Tous',
                      transaction: 'Transactions',
                      cash: 'Caisse',
                      closure: 'Clôtures',
                      security: 'Sécurité',
                      debt: 'Avances',
                      fleet: 'Flotte',
                    };

                    return (
                      <button
                        key={cat}
                        onClick={() => setLogCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>

                {/* Filtres par Sévérité */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 shrink-0">Niveau :</span>
                  {(['all', 'info', 'warning', 'critical'] as const).map((sev) => {
                    const isSelected = logSeverityFilter === sev;
                    const labels: Record<string, string> = {
                      all: 'Toutes',
                      info: 'Info',
                      warning: 'Attention',
                      critical: 'Critique',
                    };
                    return (
                      <button
                        key={sev}
                        onClick={() => setLogSeverityFilter(sev)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {labels[sev]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boutons d'export et actions globales */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} certifiée{filteredLogs.length > 1 ? 's' : ''}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter CSV</span>
                  </button>

                  <button
                    onClick={resetAuditData}
                    className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                    title="Réinitialiser démo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LISTE DES ENTRÉES DU JOURNAL */}
              <div className="space-y-2">
                {filteredLogs.map((log) => {
                  const isCrit = log.severity === 'critical';
                  const isWarn = log.severity === 'warning';

                  return (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm transition-all ${
                        isCrit
                          ? 'border-rose-500/30 bg-rose-500/[0.02]'
                          : isWarn
                          ? 'border-amber-500/30 bg-amber-500/[0.02]'
                          : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            isCrit ? 'bg-rose-500 ring-2 ring-rose-500/20' : isWarn ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {log.action}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {log.dateStr} • {log.timeStr}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 pl-4">
                        {log.details}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 pl-4">
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <User className="w-3 h-3 text-blue-500" />
                          {log.authorName} ({log.authorRole})
                        </span>

                        <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-semibold tracking-wider" title="Empreinte cryptographique infalsifiable">
                          {log.hashFingerprint}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* MODALE : VÉRIFICATION ET RÉSOLUTION D'UNE ANOMALIE */}
        {/* ======================================================== */}
        {resolvingAnomaly && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Résoudre l'alerte de sécurité
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Audit de conformité
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setResolvingAnomaly(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <strong className="block text-slate-900 dark:text-white mb-1">
                    {resolvingAnomaly.title}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {resolvingAnomaly.description}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Note de justification gérant (enregistrée au journal)
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Client venu physiquement avec CNI n°... opération légitime."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResolvingAnomaly(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmResolution}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md"
                >
                  Valider & Sceller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. NAVIGATION BASSE MOBILE */}
        {/* ======================================================== */}
        <TivoBottomNav
          activeTab="settings"
          onTabChange={onNavigateTab}
          onAddClick={onNewTransaction}
        />

      </div>
    </div>
  );
};
