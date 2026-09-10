import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  X, 
  HardDrive, 
  ShieldCheck 
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingSyncCount,
    syncQueue,
    isSyncing,
    lastSyncTime,
    syncNow,
  } = useNetwork();

  if (!isOpen) return null;

  const handleManualSync = async () => {
    if (!isOnline) {
      onShowToast?.('warning', 'Pas de connexion', 'Vous devez avoir du réseau Internet pour envoyer les données.');
      return;
    }
    const res = await syncNow();
    if (res.success) {
      onShowToast?.(
        'success',
        'Envoi réussi !',
        `${res.syncedCount} opération${res.syncedCount > 1 ? 's' : ''} envoyée${res.syncedCount > 1 ? 's' : ''} et sauvegardée${res.syncedCount > 1 ? 's' : ''}.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isOnline 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Sans Internet & Synchronisation
              </h3>
              <p className="text-[11px] text-slate-500">
                {isOnline ? 'Internet connecté' : 'Fonctionne sans Internet (Tout est gardé dans le téléphone)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* État de Connexion Principal */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border mb-4 ${
          isOnline
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <strong className="text-xs sm:text-sm font-extrabold truncate">
                {isOnline ? 'Internet connecté' : 'Pas de connexion Internet 📡'}
              </strong>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold opacity-80 shrink-0">
              Dernier envoi : {lastSyncTime}
            </span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            {isOnline
              ? 'Vos opérations sont envoyées et sécurisées en direct. Tout fonctionne normalement.'
              : 'Même sans connexion Internet, TIVO continue de marcher. Toutes vos opérations sont gardées dans le téléphone et partiront toutes seules dès que le réseau reviendra.'}
          </p>
        </div>

        {/* File d'attente de synchronisation */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Opérations gardées dans le téléphone
              </span>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              pendingSyncCount > 0 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
            }`}>
              {pendingSyncCount} à envoyer
            </span>
          </div>

          {/* Liste des items en attente */}
          {pendingSyncCount > 0 ? (
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
              {syncQueue.map((item) => (
                <div 
                  key={item.id} 
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {item.summary}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize block truncate">
                      {item.action} • {item.timestamp}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md shrink-0">
                    Gardé dans le tél.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Toutes les opérations sont à jour</span>
            </div>
          )}

          {/* Bouton Synchroniser maintenant */}
          <button
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing || pendingSyncCount === 0}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              !isOnline || pendingSyncCount === 0
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-98'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="truncate">
              {isSyncing 
                ? 'Envoi en cours...' 
                : pendingSyncCount > 0 
                ? `Envoyer maintenant (${pendingSyncCount} en attente)` 
                : 'Tout est envoyé'}
            </span>
          </button>
        </div>

        {/* Outil de Simulation Zone Blanche / Dantokpa */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between gap-2">
          <div className="pr-2 min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Tester sans Internet (Simulateur)
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Coupez Internet pour voir que TIVO continue de marcher même au fond du marché
            </span>
          </div>
          <button
            onClick={toggleSimulatedOffline}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSimulatedOffline ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSimulatedOffline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Diagnostic PWA & Service Worker */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 gap-2">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Protection hors-ligne</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-[11px] sm:text-xs">
              En marche
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 gap-2">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Mémoire du téléphone</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0 text-[11px] sm:text-xs">
              Sécurisée
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
        >
          Fermer
        </button>

      </div>
    </div>
  );
};
