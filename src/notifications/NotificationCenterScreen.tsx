// ============================================================================
// TIVO NOTIFICATION CENTER SCREEN — PHASE 18
// Centre de Notifications, Alertes Push & Alertes Seuil WhatsApp / SMS
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Settings, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Wallet, 
  Clock, 
  Send, 
  CheckCircle2, 
  Info,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { TivoNotification, NotificationPriority } from './notificationTypes';

interface NotificationCenterScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onOpenNetworks?: () => void;
  onOpenCash?: () => void;
  onOpenClosure?: () => void;
  onOpenDebts?: () => void;
  onOpenAudit?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type FilterTab = 'all' | 'unread' | 'balance' | 'security' | 'operations';

export const NotificationCenterScreen: React.FC<NotificationCenterScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onOpenNetworks,
  onOpenCash,
  onOpenClosure,
  onOpenDebts,
  onOpenAudit,
  onShowToast,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    sendWhatsAppAlert,
    testNotification,
    checkThresholds,
  } = useNotifications();

  // État local des onglets de filtres
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  // Filtrage des notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === 'unread') return !notif.read;
      if (activeFilter === 'balance') return notif.category === 'balance';
      if (activeFilter === 'security') return notif.category === 'security';
      if (activeFilter === 'operations') return notif.category === 'closure' || notif.category === 'debt';
      return true;
    });
  }, [notifications, activeFilter]);

  // Décompte par priorité
  const criticalCount = useMemo(() => {
    return notifications.filter((n) => !n.read && (n.priority === 'critical' || n.priority === 'high')).length;
  }, [notifications]);

  // Formatage du temps relatif
  const formatTimeAgo = (isoString: string): string => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'À l’instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return new Date(isoString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleActionClick = (notif: TivoNotification, actionRoute?: string, actionType?: string) => {
    markAsRead(notif.id);

    if (actionType === 'whatsapp') {
      sendWhatsAppAlert(notif);
      onShowToast?.('info', 'WhatsApp ouvert', 'Message d’alerte préparé pour le superviseur.');
      return;
    }

    if (actionType === 'recharge' || actionRoute === 'networks') {
      onOpenNetworks?.();
      return;
    }

    if (actionRoute === 'cash') {
      onOpenCash?.();
      return;
    }

    if (actionRoute === 'closure') {
      onOpenClosure?.();
      return;
    }

    if (actionRoute === 'debts') {
      onOpenDebts?.();
      return;
    }

    if (actionRoute === 'audit') {
      onOpenAudit?.();
      return;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            CRITIQUE
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ATTENTION
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-extrabold">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/20 text-[10px] font-bold">
            INFO
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string, priority: NotificationPriority) => {
    const isUrgent = priority === 'critical' || priority === 'high';
    switch (category) {
      case 'balance':
        return (
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
            isUrgent ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        );
      case 'security':
        return (
          <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'closure':
        return (
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        );
      case 'debt':
        return (
          <div className="w-9 h-9 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER AVEC ACTIONS GLOBALES */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-5 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Navigation supérieure */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => testNotification('high')}
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Tester le signal sonore et visuel"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Configurer les seuils et alertes"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Titre & Compteur */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Alertes & Vigie Opérationnelle
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5 flex items-center gap-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-500/30 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  onShowToast?.('success', 'Toutes les alertes sont marquées lues');
                }}
                className="px-3 py-1.5 rounded-xl glass-pill hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout lire</span>
              </button>
            )}
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CORPS PRINCIPAL */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-4 space-y-4">
          
          {/* BANNIÈRE D'ALERTE CRITIQUE SI NÉCESSAIRE */}
          {criticalCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-transparent border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/30 animate-bounce">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold block">
                    {criticalCount} alerte{criticalCount > 1 ? 's' : ''} prioritaire{criticalCount > 1 ? 's' : ''} en attente
                  </span>
                  <span className="text-[11px] text-rose-700 dark:text-rose-300">
                    Solde UV ou caisse sous les seuils d'intégrité opérationnelle.
                  </span>
                </div>
              </div>

              <button
                onClick={() => checkThresholds()}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shrink-0 shadow-sm"
              >
                Actualiser
              </button>
            </div>
          )}

          {/* FILTRES PAR ONGLET */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {(
              [
                { id: 'all', label: 'Toutes' },
                { id: 'unread', label: `Non lues (${unreadCount})` },
                { id: 'balance', label: 'Soldes & Flotte' },
                { id: 'security', label: 'Sécurité' },
                { id: 'operations', label: 'Clôtures & Crédits' },
              ] as const
            ).map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* LISTE DES NOTIFICATIONS */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => {
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 rounded-3xl border transition-all relative ${
                      !notif.read
                        ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 shadow-md shadow-blue-500/5'
                        : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Point bleu de non-lecture */}
                    {!notif.read && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                    )}

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* Icône de catégorie */}
                      {getCategoryIcon(notif.category, notif.priority)}

                      {/* Contenu textuel */}
                      <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getPriorityBadge(notif.priority)}
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                        </div>

                        <h3 className={`text-xs sm:text-sm font-extrabold ${
                          !notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {notif.title}
                        </h3>

                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                          {notif.message}
                        </p>

                        {/* Boutons d'action contextuels */}
                        {notif.actions && notif.actions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {notif.actions.map((act) => (
                              <button
                                key={act.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActionClick(notif, act.payload || notif.metadata?.actionRoute, act.type);
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer truncate ${
                                  act.type === 'whatsapp'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                }`}
                              >
                                {act.type === 'whatsapp' && <Send className="w-3.5 h-3.5 shrink-0" />}
                                {act.type === 'recharge' && <Wallet className="w-3.5 h-3.5 shrink-0" />}
                                <span className="truncate">{act.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bouton de suppression */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                        title="Supprimer la notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ÉTAT VIDE (ALL CAUGHT UP) */
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center my-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Toutes les alertes sont traitées !
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Aucune alerte non lue dans cette vue. Vos soldes, votre caisse et vos paramètres de sécurité sont sous contrôle.
              </p>
              <button
                onClick={() => checkThresholds()}
                className="mt-4 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Vérifier les seuils maintenant</span>
              </button>
            </div>
          )}

          {/* NETTOYAGE GLOBAL HISTORIQUE */}
          {notifications.length > 0 && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-rose-500/10 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider l'historique des alertes</span>
              </button>
            </div>
          )}

        </div>

        {/* MODALE DE PARAMÈTRES D'ALERTES */}
        <NotificationSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onShowToast={onShowToast}
        />

        {/* MODALE PERSONNALISÉE TIVO DE CONFIRMATION DE VIDAGE */}
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-150 relative">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Vider tout l'historique ?
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-5 leading-relaxed">
                Voulez-vous vraiment effacer toutes les notifications ({notifications.length}) ? Cette action est irréversible.
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllNotifications();
                    setShowClearConfirmModal(false);
                    onShowToast?.('info', 'Historique effacé', 'Toutes les alertes ont été supprimées.');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Oui, tout vider</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BARRE DE NAVIGATION INFÉRIEURE TIVO */}
        {/* ======================================================== */}
        <TivoBottomNav
          activeTab="home"
          onTabChange={onNavigateTab}
          onAddClick={onNewTransaction}
        />
      </div>
    </div>
  );
};
