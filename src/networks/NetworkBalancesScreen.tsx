import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Coins, 
  Building2, 
  History, 
  X, 
  Info,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoCard } from '../design-system/components/TivoCard';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA, sanitizeAmountInput } from '../design-system/tokens/typography';

interface NetworkBalancesScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type TabMode = 'balances' | 'recharges' | 'thresholds';

export const NetworkBalancesScreen: React.FC<NetworkBalancesScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  const { 
    networkBalances, 
    totalMobileMoneyBalance, 
    cashBalance, 
    transactions, 
    recharges, 
    alertThresholds, 
    addNetworkRecharge, 
    updateAlertThreshold 
  } = useTransactions();

  const [activeTab, setActiveTab] = useState<TabMode>('balances');
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

  // Modals
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeNetworkId, setRechargeNetworkId] = useState<string>('mtn');
  const [rechargeAmount, setRechargeAmount] = useState<string>('100000');
  const [rechargePaymentMethod, setRechargePaymentMethod] = useState<'cash' | 'external'>('cash');
  const [rechargeNote, setRechargeNote] = useState<string>('');
  const [rechargeError, setRechargeError] = useState<string | null>(null);

  // Modal Seuil
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdNetworkId, setThresholdNetworkId] = useState<string>('mtn');
  const [thresholdValue, setThresholdValue] = useState<string>('50000');

  // Helper pour trouver les infos d'un réseau
  const getNetwork = (netId: string): NetworkConfig => {
    return TIVO_NETWORKS.find((n) => n.id === netId) || TIVO_NETWORKS[4];
  };

  // Calculs détaillés par opérateur
  const networksStats = useMemo(() => {
    return TIVO_NETWORKS.map((net) => {
      const balance = networkBalances[net.id] || 0;
      const threshold = alertThresholds[net.id] ?? 50000;
      const isLow = balance <= threshold;

      // Transactions du jour pour cet opérateur
      let deposits = 0;
      let withdrawals = 0;
      let depositCount = 0;
      let withdrawalCount = 0;

      transactions.forEach((tx) => {
        if (tx.networkId === net.id) {
          if (tx.type === 'deposit') {
            deposits += tx.amount;
            depositCount++;
          } else {
            withdrawals += tx.amount;
            withdrawalCount++;
          }
        }
      });

      // Recharges du jour
      const netRecharges = recharges.filter((r) => r.networkId === net.id);
      const totalRecharged = netRecharges.reduce((sum, r) => sum + r.amount, 0);

      const sharePercent = totalMobileMoneyBalance > 0 ? (balance / totalMobileMoneyBalance) * 100 : 0;

      return {
        ...net,
        balance,
        threshold,
        isLow,
        deposits,
        withdrawals,
        depositCount,
        withdrawalCount,
        totalRecharged,
        rechargeCount: netRecharges.length,
        sharePercent,
      };
    });
  }, [networkBalances, alertThresholds, transactions, recharges, totalMobileMoneyBalance]);

  // Réseaux sous le seuil d'alerte
  const lowBalanceNetworks = useMemo(() => {
    return networksStats.filter((net) => net.isLow);
  }, [networksStats]);

  // Handler ouverture recharge modal
  const handleOpenRecharge = (networkId: string) => {
    setRechargeNetworkId(networkId);
    setRechargeAmount('100000');
    setRechargePaymentMethod('cash');
    setRechargeNote('');
    setRechargeError(null);
    setShowRechargeModal(true);
  };

  // Handler validation recharge
  const handleConfirmRecharge = () => {
    const amountNum = parseInt(rechargeAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setRechargeError('Veuillez entrer un montant valide');
      return;
    }

    const res = addNetworkRecharge({
      networkId: rechargeNetworkId,
      amount: amountNum,
      paymentMethod: rechargePaymentMethod,
      note: rechargeNote.trim() || undefined,
    });

    if (!res.success) {
      setRechargeError(res.error || 'Erreur lors du rechargement');
      return;
    }

    const netName = getNetwork(rechargeNetworkId).name;
    onShowToast?.(
      'success',
      `Compte ${netName} rechargé !`,
      `+${formatFCFA(amountNum)} ajoutés. ${rechargePaymentMethod === 'cash' ? 'Payé avec l\'argent de la caisse.' : 'Payé avec un autre compte (caisse intacte).'}`
    );

    setShowRechargeModal(false);
  };

  // Handler seuil modal
  const handleOpenThreshold = (networkId: string) => {
    setThresholdNetworkId(networkId);
    setThresholdValue(String(alertThresholds[networkId] || 50000));
    setShowThresholdModal(true);
  };

  const handleSaveThreshold = () => {
    const valNum = parseInt(thresholdValue, 10);
    if (isNaN(valNum) || valNum < 0) return;

    updateAlertThreshold(thresholdNetworkId, valNum);
    const netName = getNetwork(thresholdNetworkId).name;
    onShowToast?.(
      'info',
      `Alerte modifiée`,
      `Prévenir pour ${netName} quand il reste moins de ${formatFCFA(valNum)}`
    );
    setShowThresholdModal(false);
  };

  const parsedRechargeAmount = parseInt(rechargeAmount, 10) || 0;
  const currentSelectedBalance = networkBalances[rechargeNetworkId] || 0;
  const newProjectedBalance = currentSelectedBalance + parsedRechargeAmount;
  const newProjectedCash = rechargePaymentMethod === 'cash' ? Math.max(0, cashBalance - parsedRechargeAmount) : cashBalance;

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        <TivoHeader
          title="Argent dans les téléphones"
          subtitle="Comptes MoMo, Moov, Celtis & Recharges"
          showBack
          onBack={onBack}
          rightAction={
            <button
              onClick={() => handleOpenRecharge('mtn')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Acheter des unités</span>
            </button>
          }
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4">
          
          {/* ======================================================== */}
          {/* 2. HERO TOTAL FLOTTE & ALERTE SEUIL */}
          {/* ======================================================== */}
          <div className="relative bg-gradient-to-br from-blue-600 to-sky-600 rounded-2xl p-4 text-white shadow-tivo-md overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-200" />
                Total dans tous les téléphones
              </span>
              <button
                onClick={toggleHideBalances}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={hideBalances ? 'Afficher' : 'Masquer'}
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-2 flex items-baseline gap-2 min-w-0">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono truncate min-w-0" title={hideBalances ? '•••••• FCFA' : formatFCFA(totalMobileMoneyBalance)}>
                {hideBalances ? '•••••• FCFA' : formatFCFA(totalMobileMoneyBalance)}
              </span>
            </div>

            {/* Barre de répartition proportionnelle des réseaux */}
            <div className="mt-4 pt-3 border-t border-white/15">
              <div className="flex items-center justify-between text-[11px] text-blue-100 mb-1.5 font-medium">
                <span>Part de chaque opérateur</span>
                <span>{networksStats.length} téléphones actifs</span>
              </div>
              <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden flex gap-0.5">
                {networksStats.map((net) => (
                  <div
                    key={net.id}
                    style={{ 
                      width: `${Math.max(net.sharePercent, 2)}%`, 
                      backgroundColor: net.color 
                    }}
                    title={`${net.name}: ${net.sharePercent.toFixed(1)}%`}
                    className="h-full transition-all duration-300"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bannière d'alerte si des réseaux sont sous le seuil */}
          {lowBalanceNetworks.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1 text-xs min-w-0">
                <span className="font-bold block text-sm text-amber-700 dark:text-amber-400 truncate">
                  {lowBalanceNetworks.length} téléphone{lowBalanceNetworks.length > 1 ? 's ont' : ' a'} presque plus d'unités !
                </span>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                  {lowBalanceNetworks.map((n) => `${n.name} (${hideBalances ? '•••••• FCFA' : formatFCFA(n.balance)})`).join(', ')}. Attention : vous risquez de ne plus pouvoir envoyer d'argent aux clients.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenRecharge(lowBalanceNetworks[0].id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Recharger {lowBalanceNetworks[0].name}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Tous les comptes ont assez d'argent pour servir les clients.</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. TABS SEGMENTÉS */}
          {/* ======================================================== */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('balances')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all truncate ${
                activeTab === 'balances'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Soldes téléphones
            </button>
            <button
              onClick={() => setActiveTab('recharges')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'recharges'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="truncate">Achats d'unités</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-extrabold shrink-0">
                {recharges.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all truncate ${
                activeTab === 'thresholds'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Alertes solde bas
            </button>
          </div>

          {/* ======================================================== */}
          {/* 4. CONTENU DE L'ONGLET SÉLECTIONNÉ */}
          {/* ======================================================== */}
          
          {/* ONGLET 1 : SOLDES PAR OPÉRATEUR */}
          {activeTab === 'balances' && (
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {networksStats.map((net) => (
                <TivoCard
                  key={net.id}
                  variant="default"
                  className={`p-3.5 sm:p-4 transition-all relative overflow-hidden ${
                    net.isLow ? 'ring-2 ring-amber-500/50 dark:ring-amber-500/40 bg-amber-500/5' : ''
                  }`}
                >
                  {/* Bandelette de couleur réseau */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: net.color }}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: net.badgeBg, color: net.textColor }}
                      >
                        {net.code}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {net.name}
                          </h3>
                          {net.isLow && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-white flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Presque vide !</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          Alerter sous : {formatFCFA(net.threshold)}
                        </span>
                      </div>
                    </div>

                    {/* Solde actuel */}
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono block truncate" title={hideBalances ? '•••••• FCFA' : formatFCFA(net.balance)}>
                        {hideBalances ? '•••••• FCFA' : formatFCFA(net.balance)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {net.sharePercent.toFixed(1)}% du total
                      </span>
                    </div>
                  </div>

                  {/* Flux journalier pour cet opérateur */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Envoyé</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-[11px] sm:text-xs mt-0.5 block truncate" title={hideBalances ? '••••' : `−${formatFCFA(net.deposits)}`}>
                        {hideBalances ? '••••' : `−${formatFCFA(net.deposits)}`}
                      </span>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Retiré</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs mt-0.5 block truncate" title={hideBalances ? '••••' : `+${formatFCFA(net.withdrawals)}`}>
                        {hideBalances ? '••••' : `+${formatFCFA(net.withdrawals)}`}
                      </span>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Rechargé</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px] sm:text-xs mt-0.5 block truncate" title={hideBalances ? '••••' : `+${formatFCFA(net.totalRecharged)}`}>
                        {hideBalances ? '••••' : `+${formatFCFA(net.totalRecharged)}`}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'action pour ce réseau */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRecharge(net.id)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      <span>Acheter des unités</span>
                    </button>
                    <button
                      onClick={() => handleOpenThreshold(net.id)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                      title="Modifier le seuil d'alerte"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Régler alerte</span>
                    </button>
                  </div>
                </TivoCard>
              ))}
            </div>
          )}

          {/* ONGLET 2 : HISTORIQUE DES RECHARGES DE FLOTTE */}
          {activeTab === 'recharges' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Achats d'unités enregistrés ({recharges.length})
                </span>
                <button
                  onClick={() => handleOpenRecharge('mtn')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Acheter des unités</span>
                </button>
              </div>

              {recharges.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <History className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun achat d'unités noté</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Notez ici quand vous achetez des unités (recharge UV) auprès de votre fournisseur ou de la banque.
                  </p>
                  <button
                    onClick={() => handleOpenRecharge('mtn')}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
                  >
                    + Noter un achat d'unités
                  </button>
                </div>
              ) : (
                recharges.map((r) => {
                  const netConfig = getNetwork(r.networkId);
                  return (
                    <TivoCard key={r.id} variant="default" className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                          style={{ backgroundColor: netConfig.badgeBg, color: netConfig.textColor }}
                        >
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {netConfig.name}
                            </span>
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 shrink-0 ${
                              r.paymentMethod === 'cash' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                              {r.paymentMethod === 'cash' ? <Coins className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                              <span>{r.paymentMethod === 'cash' ? 'Payé en espèces (Caisse)' : 'Autre compte (Banque/Perso)'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {r.note || 'Achat d\'unités'} • {r.timeStr}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs sm:text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono block truncate" title={hideBalances ? '•••••• FCFA' : `+${formatFCFA(r.amount)}`}>
                          {hideBalances ? '•••••• FCFA' : `+${formatFCFA(r.amount)}`}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                          {r.dateStr}
                        </span>
                      </div>
                    </TivoCard>
                  );
                })
              )}
            </div>
          )}

          {/* ONGLET 3 : CONFIGURATION DES SEUILS D'ALERTE */}
          {activeTab === 'thresholds' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <p>
                  Choisissez ici le montant en dessous duquel TIVO doit vous prévenir pour que vous ne tombiez jamais à court d'unités.
                </p>
              </div>

              {networksStats.map((net) => (
                <TivoCard key={net.id} variant="default" className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: net.badgeBg, color: net.textColor }}
                    >
                      {net.code}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {net.name}
                      </h4>
                      <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">
                        Solde actuel : {formatFCFA(net.balance)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 font-mono block truncate" title={formatFCFA(net.threshold)}>
                        {formatFCFA(net.threshold)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block">Alerter sous</span>
                    </div>
                    <button
                      onClick={() => handleOpenThreshold(net.id)}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                      title="Modifier"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>
                </TivoCard>
              ))}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* 5. MODAL RECHARGEMENT FLOTTE (ACHAT UV) */}
        {/* ======================================================== */}
        {showRechargeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Acheter des unités (Recharge)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ajouter de l'argent dans un téléphone
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sélection de l'opérateur */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Quel opérateur recharger ?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIVO_NETWORKS.slice(0, 3).map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setRechargeNetworkId(net.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        rechargeNetworkId === net.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                      <span>{net.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Combien d'unités acheter ? (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rechargeAmount}
                    onChange={(e) => {
                      setRechargeAmount(sanitizeAmountInput(e.target.value));
                      setRechargeError(null);
                    }}
                    placeholder="100 000"
                    className="w-full text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    FCFA
                  </span>
                </div>

                {/* Raccourcis rapides */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[50000, 100000, 200000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRechargeAmount(String(val))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-semibold transition-colors"
                    >
                      +{val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode de règlement */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Comment avez-vous payé ?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRechargePaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      rechargePaymentMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Avec l'argent de la caisse</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispo : {formatFCFA(cashBalance)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRechargePaymentMethod('external')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      rechargePaymentMethod === 'external'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Autre compte / Banque / Perso</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ne touche pas à la caisse
                    </span>
                  </button>
                </div>
              </div>

              {/* Note / Fournisseur optionnel */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Où avez-vous acheté ? (Optionnel)
                </label>
                <input
                  type="text"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  placeholder="Ex: Master Agent, Banque BOA, Marchand..."
                  className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Erreur éventuelle */}
              {rechargeError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{rechargeError}</span>
                </div>
              )}

              {/* Projection avant / après */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-400 block text-[11px] uppercase tracking-wider">
                  Ce qui change :
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compte {getNetwork(rechargeNetworkId).name} :</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatFCFA(currentSelectedBalance)} → {formatFCFA(newProjectedBalance)}
                  </span>
                </div>
                {rechargePaymentMethod === 'cash' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Argent liquide en caisse :</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatFCFA(cashBalance)} → {formatFCFA(newProjectedCash)}
                    </span>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <TivoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex-1"
                  onClick={handleConfirmRecharge}
                >
                  Valider la recharge
                </TivoButton>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. MODAL MODIFIER SEUIL D'ALERTE */}
        {/* ======================================================== */}
        {showThresholdModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Alerte solde bas {getNetwork(thresholdNetworkId).name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowThresholdModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Me prévenir quand ce compte descend en dessous de :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(sanitizeAmountInput(e.target.value))}
                    className="w-full text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 pr-14 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {[25000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setThresholdValue(String(val))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                    >
                      {formatFCFA(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowThresholdModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Annuler
                </button>
                <TivoButton
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={handleSaveThreshold}
                >
                  Valider l'alerte
                </TivoButton>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. BOTTOM NAVIGATION */}
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
