import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  FileText, 
  Calendar, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  X,
  Sparkles,
  TrendingUp,
  Smartphone,
  Info,
  Users,
  WifiOff,
  Settings,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Bell,
  ArrowRightLeft,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useAgency } from '../context/AgencyContext';
import { useNetwork } from '../context/NetworkContext';
import { useAudit } from '../context/AuditContext';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import { OfflineSyncModal } from '../offline/OfflineSyncModal';
import { OfficialIdPhotoModal } from '../profile/OfficialIdPhotoModal';
import { PwaInstallBanner } from '../design-system/components/PwaInstallBanner';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TivoButton } from '../design-system/components/TivoButton';

interface DashboardScreenProps {
  onNewTransaction?: () => void;
  onViewAllTransactions?: () => void;
  onOpenNetworks?: () => void;
  onOpenCash?: () => void;
  onOpenClosure?: () => void;
  onOpenExport?: () => void;
  onOpenDebts?: () => void;
  onOpenProfile?: () => void;
  onOpenTariffs?: () => void;
  onOpenAudit?: () => void;
  onOpenNotifications?: () => void;
  onOpenCurrency?: () => void;
  onOpenShowcase?: () => void;
  onNavigateTab?: (tab: NavTabId) => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNewTransaction,
  onViewAllTransactions,
  onOpenNetworks,
  onOpenCash,
  onOpenClosure,
  onOpenExport,
  onOpenDebts,
  onOpenProfile,
  onOpenTariffs,
  onOpenAudit,
  onOpenNotifications,
  onOpenCurrency,
  onOpenShowcase,
  onNavigateTab,
  onShowToast,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, pendingSyncCount } = useNetwork();
  const { securityScore, activeAnomaliesCount } = useAudit();
  const { unreadCount } = useNotifications();
  const { todayExchangeGainsXof } = useCurrency();
  const { 
    transactions, 
    networkBalances, 
    cashBalance, 
    totalMobileMoneyBalance, 
    todaySummary,
    estimatedDailyCommissions,
    isTodayClosed,
    debts,
    totalDebtsAmount
  } = useTransactions();

  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [hideBalances, setHideBalances] = useState<boolean>(() => {
    return localStorage.getItem('tivo_hide_balances') === 'true';
  });

  useEffect(() => {
    const handleSync = () => {
      setHideBalances(localStorage.getItem('tivo_hide_balances') === 'true');
    };
    window.addEventListener('tivo_hide_balances_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tivo_hide_balances_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleHideBalances = () => {
    setHideBalances((prev) => {
      const next = !prev;
      localStorage.setItem('tivo_hide_balances', String(next));
      window.dispatchEvent(new Event('tivo_hide_balances_changed'));
      return next;
    });
  };

  const { activeCashier, cashiers, switchCashier } = useAgency();

  // Mode Espace Caissier (Utilisateur) vs Espace Administrateur (Gérant)
  const [currentSpace, setCurrentSpace] = useState<'caissier' | 'admin'>(() => {
    return user?.role === 'caissier' ? 'caissier' : 'admin';
  });
  const [showSpaceModal, setShowSpaceModal] = useState<boolean>(false);
  const [targetSpace, setTargetSpace] = useState<'caissier' | 'admin'>('caissier');
  const [spaceAdminPin, setSpaceAdminPin] = useState<string>('');
  const [spacePinError, setSpacePinError] = useState<string | null>(null);

  // Modal Photo de Profil d'Identité CNI/CIP
  const [showIdPhotoModal, setShowIdPhotoModal] = useState<boolean>(false);

  // Modals d'actions rapides du Dashboard
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showClosureModal, setShowClosureModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);

  // Récupérer les 5 dernières transactions
  const recentTransactions = transactions.slice(0, 5);

  // Helper pour trouver les métadonnées d'un réseau
  const getNetwork = (networkId: string): NetworkConfig => {
    return TIVO_NETWORKS.find((n) => n.id === networkId) || TIVO_NETWORKS[4];
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. TOP HEADER BLEU GÉRANT (Design Sobre & Professionnel) */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Barre supérieure : Statut réseau + Actions utilisateur */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <button
              onClick={() => setShowOfflineModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium text-white shadow-xs hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              title="Gérer le mode hors-ligne et la synchronisation"
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'En ligne' : `Hors-ligne ${pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}`}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNotifications}
                aria-label="Centre de notifications et alertes"
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white relative cursor-pointer"
                title="Notifications et alertes de seuil"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleHideBalances}
                aria-label="Masquer ou afficher les soldes"
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
                title={hideBalances ? 'Afficher les soldes' : 'Masquer pour discrétion'}
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Changer de thème"
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
              </button>

              <button
                onClick={onOpenProfile}
                aria-label="Paramètres et Profil"
                className="p-2 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Profil & Paramètres de l'agence"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                aria-label="Se déconnecter"
                className="p-2 rounded-full glass-pill hover:bg-rose-500/30 active:scale-95 transition-all text-white"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SÉPARATION DES ESPACES : Espace Utilisateur (Caissier) vs Espace Administrateur (Gérant) */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5 min-w-0">
            <button
              onClick={() => {
                setTargetSpace(currentSpace === 'caissier' ? 'admin' : 'caissier');
                setSpaceAdminPin('');
                setSpacePinError(null);
                setShowSpaceModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 border border-white/20 bg-white/10 hover:bg-white/15 text-white whitespace-nowrap min-w-0 flex-1 sm:flex-initial"
              title="Cliquer pour basculer entre Espace Caissier et Espace Administrateur"
            >
              {currentSpace === 'caissier' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">👤 Espace Caissier</span>
                  <span className="text-[9px] opacity-80 font-medium bg-white/20 px-1.5 py-0.5 rounded-md shrink-0">Bascule ▾</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">🛡️ Espace Gérant</span>
                  <span className="text-[9px] opacity-80 font-medium bg-white/20 px-1.5 py-0.5 rounded-md shrink-0">Bascule ▾</span>
                </>
              )}
            </button>

            {/* Pastille Photo d'Identité CNI / CIP */}
            <button
              onClick={() => setShowIdPhotoModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-[11px] font-bold text-white hover:bg-white/25 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              title="Gérer la photo de profil officielle format Carte d'Identité"
            >
              {activeCashier.isPhotoLocked && activeCashier.idPhotoUrl ? (
                <>
                  <Lock className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span className="text-emerald-200">Photo CNI 🔒</span>
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-amber-200">+ Photo CNI</span>
                </>
              )}
            </button>
          </div>

          {/* Salutation et 3 boutons rapides avec Photo d'Identité CNI */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              {/* Photo officielle de profil format Carte d'Identité */}
              <button
                type="button"
                onClick={() => setShowIdPhotoModal(true)}
                className="relative group shrink-0 focus:outline-none"
                title="Ouvrir la photo officielle format Carte d'Identité"
              >
                <div className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {activeCashier.idPhotoUrl ? (
                    <img
                      src={activeCashier.idPhotoUrl}
                      alt={activeCashier.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1 text-white">
                      <Camera className="w-5 h-5 text-cyan-200" />
                      <span className="text-[8px] font-bold text-cyan-100 mt-0.5 uppercase">CNI</span>
                    </div>
                  )}
                </div>

                {/* Badge Cadenas 🔒 si verrouillée */}
                {activeCashier.isPhotoLocked && activeCashier.idPhotoUrl ? (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-blue-600">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md border-2 border-blue-600 text-[10px] font-black">
                    !
                  </span>
                )}
              </button>

              <div 
                onClick={onOpenProfile}
                className="cursor-pointer group min-w-0 flex-1"
                title="Gérer le profil de l'agence et les caissiers"
              >
                <span className="text-[11px] sm:text-xs text-blue-100 font-normal block truncate">
                  {currentSpace === 'caissier' ? 'Opérateur en caisse :' : 'Gérant principal :'}
                </span>
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 group-hover:text-blue-100 transition-colors">
                  <span className="truncate">{currentSpace === 'caissier' ? activeCashier.name : (user?.name || 'Nazirou GBADAMASSI')}</span>
                  <span className="shrink-0">👋</span>
                </h1>
                <p className="text-[10.5px] sm:text-[11px] text-blue-100/80 font-medium group-hover:text-white transition-colors truncate">
                  {activeCashier.shift} • Profil →
                </p>
              </div>
            </div>

            {/* 4 Icônes d'action en haut à droite */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Bouton Wallet (Soldes réseaux) */}
              <button
                onClick={() => {
                  if (onOpenNetworks) {
                    onOpenNetworks();
                  } else {
                    setShowWalletModal(true);
                  }
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all relative"
                title="Détail des soldes par opérateur & flotte"
              >
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {Object.keys(networkBalances).length}
                </span>
              </button>

              {/* Bouton Carnet de Dettes / Avances */}
              <button
                onClick={onOpenDebts}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all relative"
                title="Carnet de Dettes & Avances clients"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {debts.filter((d) => d.status !== 'paid').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {debts.filter((d) => d.status !== 'paid').length}
                  </span>
                )}
              </button>

              {/* Bouton Export */}
              <button
                onClick={() => {
                  if (onOpenExport) {
                    onOpenExport();
                  } else {
                    setShowExportModal(true);
                  }
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
                title="Exportation comptable & WhatsApp"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Bouton Clôture */}
              <button
                onClick={() => {
                  if (onOpenClosure) {
                    onOpenClosure();
                  } else {
                    setShowClosureModal(true);
                  }
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all relative ${
                  isTodayClosed ? 'ring-2 ring-emerald-400/60 bg-emerald-500/20' : ''
                }`}
                title={isTodayClosed ? 'Journée clôturée (Voir le rapport)' : 'Clôture journalière'}
              >
                {isTodayClosed ? <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" /> : <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {isTodayClosed && (
                  <span className="absolute -top-1 -right-1 bg-emerald-400 w-2.5 h-2.5 rounded-full ring-2 ring-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* CARTE HERO DES SOLDES (Mobile Money vs Espèces) */}
          <div className="relative z-10 bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 mb-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 divide-x divide-white/15">
              {/* Solde Total Mobile Money */}
              <div 
                onClick={onOpenNetworks}
                className="pr-2 cursor-pointer group min-w-0"
                title="Cliquer pour voir et recharger les comptes téléphones"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-blue-100 uppercase tracking-wider font-semibold flex items-center gap-1 truncate">
                    <Smartphone className="w-3 h-3 text-cyan-300 shrink-0" />
                    <span className="truncate">Argent dans les téléphones</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
                <span className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight mt-1 block truncate">
                  {hideBalances ? '•••••• FCFA' : formatFCFA(totalMobileMoneyBalance)}
                </span>
                <span className="text-[10px] text-blue-100/70 group-hover:text-white transition-colors truncate block">
                  {Object.keys(networkBalances).length} comptes MoMo/Moov • Voir →
                </span>
              </div>

              {/* Solde Espèces Physique */}
              <div 
                onClick={onOpenCash}
                className="pl-2.5 sm:pl-3 cursor-pointer group min-w-0"
                title="Cliquer pour voir les billets et pièces en caisse"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-blue-100 uppercase tracking-wider font-semibold flex items-center gap-1 truncate">
                    <Wallet className="w-3 h-3 text-emerald-300 shrink-0" />
                    <span className="truncate">Argent liquide (Caisse)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
                <span className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight mt-1 block truncate">
                  {hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}
                </span>
                <span className="text-[10px] text-emerald-200 group-hover:text-white transition-colors font-medium truncate block">
                  Billets & Pièces • Compter →
                </span>
              </div>
            </div>
          </div>

          {/* GROS BOUTON + NOUVELLE TRANSACTION */}
          <div className="relative z-10">
            <button
              onClick={onNewTransaction}
              className="w-full h-12 bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-tivo-md active:scale-[0.98] transition-all btn-press"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Faire une opération (Dépôt / Retrait)</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CORPS DU DASHBOARD */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4">

          {/* BANNIÈRE D'INSTALLATION PWA */}
          <PwaInstallBanner />

          {/* BANNIÈRE MODE HORS-LIGNE (PHASE 14) */}
          {!isOnline && (
            <div 
              onClick={() => setShowOfflineModal(true)}
              className="cursor-pointer p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-amber-900 dark:text-amber-200 shadow-sm hover:bg-amber-500/20 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    Pas de connexion Internet 📡
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400">
                    Vos opérations sont bien gardées dans le téléphone ({pendingSyncCount} en attente d'envoi).
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 shrink-0">
                Voir envois →
              </span>
            </div>
          )}

          {/* BANNIÈRE JOURNÉE CLÔTURÉE */}
          {isTodayClosed && (
            <div 
              onClick={onOpenClosure}
              className="cursor-pointer p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-emerald-900 dark:text-emerald-200 shadow-sm hover:bg-emerald-500/20 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    Journée fermée à clé 🔒
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    La caisse du jour est arrêtée. Personne ne peut modifier les montants.
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                Voir le bilan →
              </span>
            </div>
          )}

          {/* BANNIÈRE ALERTE SÉCURITÉ & FRAUDE */}
          {activeAnomaliesCount > 0 && (
            <div 
              onClick={onOpenAudit}
              className="cursor-pointer p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-rose-900 dark:text-rose-200 shadow-sm hover:bg-rose-500/20 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {activeAnomaliesCount} Alerte{activeAnomaliesCount > 1 ? 's' : ''} à vérifier ⚠️
                  </span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-400">
                    Une opération inhabituelle ou un possible doublon nécessite votre coup d'œil.
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 shrink-0">
                Vérifier →
              </span>
            </div>
          )}

          {/* CARTE 1 : RÉSUMÉ DU JOUR (3 COLONNES) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Résumé du jour
              </h2>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Aujourd'hui
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
              {/* Dépôts */}
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </div>
                <span 
                  className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate w-full"
                  title={hideBalances ? '••••' : formatFCFA(todaySummary.totalDeposits, false)}
                >
                  {hideBalances ? '••••' : formatFCFA(todaySummary.totalDeposits, false)}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap truncate w-full block">
                  Envoyé ({todaySummary.depositCount})
                </span>
              </div>

              {/* Retraits */}
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </div>
                <span 
                  className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate w-full"
                  title={hideBalances ? '••••' : formatFCFA(todaySummary.totalWithdrawals, false)}
                >
                  {hideBalances ? '••••' : formatFCFA(todaySummary.totalWithdrawals, false)}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap truncate w-full block">
                  Retiré ({todaySummary.withdrawalCount})
                </span>
              </div>

              {/* Solde théorique / Espèces */}
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span 
                  className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate w-full"
                  title={hideBalances ? '••••' : formatFCFA(cashBalance, false)}
                >
                  {hideBalances ? '••••' : formatFCFA(cashBalance, false)}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap truncate w-full block">
                  Attendu en caisse
                </span>
              </div>
            </div>

            {/* Footer de la carte résumé */}
            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs min-w-0">
              <span className="font-semibold text-slate-500 dark:text-slate-400 truncate min-w-0">
                {todaySummary.transactionCount} opération{todaySummary.transactionCount > 1 ? 's' : ''} enregistrée{todaySummary.transactionCount > 1 ? 's' : ''}
              </span>
              <span className={`font-bold flex items-center gap-1 shrink-0 whitespace-nowrap ${
                todaySummary.netVariation >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {todaySummary.netVariation >= 0 ? '+' : ''}
                {hideBalances ? '••••' : formatFCFA(todaySummary.netVariation)}
              </span>
            </div>
          </section>

          {/* CARTE AVANCES & CRÉDITS CLIENTS */}
          <div 
            onClick={onOpenDebts}
            className="cursor-pointer bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-900/10 border border-amber-500/25 hover:border-amber-500/40 rounded-3xl p-3.5 sm:p-4 shadow-sm transition-all active:scale-[0.99] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Argent dehors (Dettes & Crédits)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold shrink-0 whitespace-nowrap">
                    {debts.filter((d) => d.status !== 'paid').length} en cours
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                  Ce que les clients doivent : <strong className="text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap">{hideBalances ? '•••••• FCFA' : formatFCFA(totalDebtsAmount)}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
              <span className="whitespace-nowrap">Voir</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARTE COMMISSIONS & GRILLES TARIFAIRES */}
          <div 
            onClick={onOpenTariffs}
            className="cursor-pointer bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-teal-900/10 border border-emerald-500/25 hover:border-emerald-500/40 rounded-3xl p-3.5 sm:p-4 shadow-sm transition-all active:scale-[0.99] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Mes Bénéfices & Prix d'envoi
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 whitespace-nowrap">
                    Calculateur
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                  Votre part d'argent : <strong className="text-emerald-600 dark:text-emerald-400 font-black whitespace-nowrap">{hideBalances ? '•••••• FCFA' : `+${formatFCFA(estimatedDailyCommissions)}`}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="whitespace-nowrap">Calculer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARTE SÉCURITÉ & AUDIT TRAIL (PHASE 17) */}
          <div 
            onClick={onOpenAudit}
            className="cursor-pointer bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/30 dark:via-indigo-900/10 border border-blue-500/25 hover:border-blue-500/40 rounded-3xl p-3.5 sm:p-4 shadow-sm transition-all active:scale-[0.99] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Sécurité & Journal d'Audit
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold shrink-0 whitespace-nowrap">
                    Score {securityScore.score}/100
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                  {activeAnomaliesCount > 0 ? (
                    <strong className="text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">{activeAnomaliesCount} alerte{activeAnomaliesCount > 1 ? 's' : ''} à traiter</strong>
                  ) : (
                    'Protection active • Journal infalsifiable'
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
              <span className="whitespace-nowrap">Gérer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARTE NOTIFICATIONS & ALERTES SEUILS (PHASE 18) */}
          <div 
            onClick={onOpenNotifications}
            className="cursor-pointer bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/30 dark:via-purple-900/10 border border-indigo-500/25 hover:border-indigo-500/40 rounded-3xl p-3.5 sm:p-4 shadow-sm transition-all active:scale-[0.99] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    Notifications & Alertes
                  </span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black shrink-0 whitespace-nowrap">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 whitespace-nowrap">
                      À jour
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                  Seuils de flotte UV • Sons • WhatsApp
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              <span className="whitespace-nowrap">Voir</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARTE CHANGE MULTI-DEVISES & FRONTIÈRE (PHASE 19) */}
          <div 
            onClick={onOpenCurrency}
            className="cursor-pointer bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all active:scale-[0.99] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                    Change & Devises
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
                    <span>🇳🇬 🇪🇺 🇺🇸 🇬🇭</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                  Gains : <strong className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">+{formatFCFA(todayExchangeGainsXof)}</strong> • Dantokpa & Frontière
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              <span className="whitespace-nowrap">Changer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARTE 2 : TRANSACTIONS RÉCENTES */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Transactions récentes
                </h2>
                {recentTransactions.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {recentTransactions.length}
                  </span>
                )}
              </div>
              <button
                onClick={onViewAllTransactions}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Voir tout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* LISTE DES 5 OPÉRATIONS */}
            {recentTransactions.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => {
                  const net = getNetwork(tx.networkId);
                  const isDeposit = tx.type === 'deposit';

                  return (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors gap-2"
                    >
                      {/* Côté Gauche : Icône + Nom / Numéro / Réseau */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isDeposit
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {tx.clientName || 'Client anonyme'}
                            </span>
                            {tx.isLocked && (
                              <span title="Transaction clôturée" className="shrink-0">
                                <Lock className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                              style={{
                                backgroundColor: net.badgeBg,
                                color: net.textColor,
                                borderColor: net.borderColor,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: net.color }} />
                              <span>{net.code}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {tx.clientPhone}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                              • {tx.timeStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Côté Droit : Montant */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm md:text-base font-extrabold tracking-tight block leading-tight ${
                            isDeposit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isDeposit ? '+' : '−'} {hideBalances ? '••••' : formatFCFA(tx.amount)}
                        </span>
                        <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                          {isDeposit ? 'Dépôt' : 'Retrait'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ÉTAT VIDE ÉPURÉ */
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <Plus className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Aucune opération pour le moment
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs">
                  Vos envois (dépôts) et retraits s'afficheront ici au fur et à mesure.
                </p>
                <button
                  onClick={onNewTransaction}
                  className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  + Faire une opération
                </button>
              </div>
            )}
          </section>


          {/* BANDEAU ACCÈS AU DESIGN SYSTEM */}
          {onOpenShowcase && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-500/10 border border-blue-500/20 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Vitrine Design System (Phase 1)
                </span>
              </div>
              <button
                onClick={onOpenShowcase}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ouvrir
              </button>
            </div>
          )}

        </main>

        {/* NAVIGATION BASSE MOBILE FIXE */}
        <TivoBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'settings' && onOpenProfile) {
              onOpenProfile();
            } else {
              onNavigateTab?.(tab);
            }
          }}
          onAddClick={onNewTransaction}
        />

        {/* ======================================================== */}
        {/* MODAL 1 : WALLET / SOLDES RÉSEAUX DÉTAILLÉS */}
        {/* ======================================================== */}
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Soldes par Réseau
                    </h3>
                    <p className="text-xs text-slate-500">Comptes Mobile Money enregistrés</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Liste des soldes par opérateur */}
              <div className="flex flex-col gap-2.5 my-4">
                {TIVO_NETWORKS.map((net) => {
                  const balance = networkBalances[net.id] || 0;
                  return (
                    <div
                      key={net.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: net.color }}
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {net.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{net.country}</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatFCFA(balance)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onOpenNetworks && (
                  <TivoButton
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowWalletModal(false);
                      onOpenNetworks();
                    }}
                  >
                    Gérer & réapprovisionner la flotte →
                  </TivoButton>
                )}
                <TivoButton
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowWalletModal(false)}
                >
                  Fermer
                </TivoButton>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2 : CLÔTURE JOURNALIÈRE (Aperçu) */}
        {/* ======================================================== */}
        {showClosureModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Clôture Journalière</span>
                      <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Pro
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Verrouillage et report des soldes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClosureModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 mb-4">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  La clôture journalière verrouille toutes les transactions du jour et reporte automatiquement vos soldes réseaux et espèces au jour suivant.
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs mb-4">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Dépôts du jour :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatFCFA(todaySummary.totalDeposits)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Retraits du jour :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatFCFA(todaySummary.totalWithdrawals)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Solde Espèces physique :</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(cashBalance)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onOpenClosure && (
                  <TivoButton
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowClosureModal(false);
                      onOpenClosure();
                    }}
                  >
                    Ouvrir l'écran de clôture officiel →
                  </TivoButton>
                )}
                <TivoButton
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowClosureModal(false)}
                >
                  Fermer
                </TivoButton>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3 : EXPORT COMPTABLE (Aperçu) */}
        {/* ======================================================== */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Exportation des Données</span>
                      <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Pro
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Génération de rapports comptables</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Formats d'export disponibles pour vos {transactions.length} transactions enregistrées :
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold mb-5">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                  PDF
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  EXCEL
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                  CSV
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onOpenExport && (
                  <TivoButton
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowExportModal(false);
                      onOpenExport();
                    }}
                  >
                    Ouvrir le centre d'exportation complet →
                  </TivoButton>
                )}
                <TivoButton
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowExportModal(false)}
                >
                  Fermer
                </TivoButton>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4 : MODE HORS-LIGNE & SYNCHRONISATION (PHASE 14) */}
        <OfflineSyncModal
          isOpen={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          onShowToast={onShowToast}
        />

        {/* ======================================================== */}
        {/* MODAL 5 : PHOTO DE PROFIL D'IDENTITÉ OFFICIELLE (CNI/CIP) */}
        {/* ======================================================== */}
        <OfficialIdPhotoModal
          cashier={activeCashier}
          isOpen={showIdPhotoModal}
          onClose={() => setShowIdPhotoModal(false)}
          onShowToast={onShowToast}
        />

        {/* ======================================================== */}
        {/* MODAL 6 : BASCULE D'ESPACE (CAISSIER VS ADMINISTRATEUR) */}
        {/* ======================================================== */}
        {showSpaceModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Bascule d'Espace
                    </h3>
                    <p className="text-xs text-slate-500">Choisissez votre rôle de travail</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSpaceModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sélection des deux espaces */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Option 1 : Espace Caissier */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetSpace('caissier');
                    setSpacePinError(null);
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    targetSpace === 'caissier'
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl">👤</span>
                  <span className="font-extrabold text-xs">Espace Caissier</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Opérations guichet, factures, clôture caisse
                  </span>
                </button>

                {/* Option 2 : Espace Administrateur */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetSpace('admin');
                    setSpacePinError(null);
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    targetSpace === 'admin'
                      ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl">🛡️</span>
                  <span className="font-extrabold text-xs">Espace Gérant</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Contrôle global, audit, gestion d'équipe
                  </span>
                </button>
              </div>

              {/* Si on souhaite passer en mode Administrateur : PIN obligatoire */}
              {targetSpace === 'admin' && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2.5 mb-4 animate-fade-in">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
                    Code PIN Administrateur requis (Défaut : 1234) :
                  </span>
                  <input
                    type="password"
                    maxLength={6}
                    value={spaceAdminPin}
                    onChange={(e) => setSpaceAdminPin(e.target.value)}
                    placeholder="PIN Administrateur..."
                    className="w-full h-11 px-3 text-center font-mono font-black text-lg rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {spacePinError && (
                    <span className="text-[11px] font-bold text-rose-600 block text-center">
                      {spacePinError}
                    </span>
                  )}
                </div>
              )}

              {/* Si on est en mode Caissier : Sélecteur du caissier actif */}
              {targetSpace === 'caissier' && (
                <div className="mb-4 space-y-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    Opérateur actif au comptoir :
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {cashiers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => switchCashier(c.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          c.id === activeCashier.id
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                            {c.name.substring(0, 1)}
                          </span>
                          <span className="text-xs">{c.name}</span>
                        </div>
                        {c.id === activeCashier.id && (
                          <span className="text-[10px] text-blue-600 font-bold uppercase">Actif ✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton de validation de la bascule */}
              <div className="pt-2 flex items-center gap-2">
                <TivoButton
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowSpaceModal(false)}
                >
                  Annuler
                </TivoButton>

                <TivoButton
                  variant="primary"
                  size="md"
                  className="flex-1 !bg-blue-600 hover:!bg-blue-700 shadow-md"
                  onClick={() => {
                    if (targetSpace === 'admin') {
                      if (spaceAdminPin.trim() !== '1234') {
                        setSpacePinError('Code PIN Administrateur incorrect.');
                        return;
                      }
                      setCurrentSpace('admin');
                      setShowSpaceModal(false);
                      onShowToast?.('success', 'Espace Administrateur activé 🛡️', 'Tous les droits de gérance sont débloqués.');
                    } else {
                      setCurrentSpace('caissier');
                      setShowSpaceModal(false);
                      onShowToast?.('info', 'Espace Caissier activé 👤', `Opérateur en poste : ${activeCashier.name}`);
                    }
                  }}
                >
                  Confirmer
                </TivoButton>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
