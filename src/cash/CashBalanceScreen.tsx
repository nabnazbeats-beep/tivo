import React, { useState, useMemo, useEffect } from 'react';
import { 
  Coins, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Plus, 
  Minus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  X, 
  Sparkles, 
  Info, 
  Eye, 
  EyeOff, 
  Scale 
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoCard } from '../design-system/components/TivoCard';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { formatFCFA, sanitizeAmountInput } from '../design-system/tokens/typography';

interface CashBalanceScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type TabMode = 'calculator' | 'movements' | 'history';

// Définition officielle des coupures UEMOA / FCFA (BCEAO)
interface DenominationConfig {
  value: number;
  label: string;
  type: 'note' | 'coin';
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
}

const UEMOA_DENOMINATIONS: DenominationConfig[] = [
  // Billets UEMOA
  { value: 10000, label: '10 000 Billet', type: 'note', color: '#7C3AED', bgLight: 'var(--den-10000-bg, #F5F3FF)', textColor: 'var(--den-10000-text, #5B21B6)', borderColor: 'var(--den-10000-border, #DDD6FE)' },
  { value: 5000, label: '5 000 Billet', type: 'note', color: '#059669', bgLight: 'var(--den-5000-bg, #ECFDF5)', textColor: 'var(--den-5000-text, #065F46)', borderColor: 'var(--den-5000-border, #A7F3D0)' },
  { value: 2000, label: '2 000 Billet', type: 'note', color: '#2563EB', bgLight: 'var(--den-2000-bg, #EFF6FF)', textColor: 'var(--den-2000-text, #1E40AF)', borderColor: 'var(--den-2000-border, #BFDBFE)' },
  { value: 1000, label: '1 000 Billet', type: 'note', color: '#EA580C', bgLight: 'var(--den-1000-bg, #FFF7ED)', textColor: 'var(--den-1000-text, #9A3412)', borderColor: 'var(--den-1000-border, #FED7AA)' },
  { value: 500, label: '500 Billet', type: 'note', color: '#65A30D', bgLight: 'var(--den-500-bg, #F7FEE7)', textColor: 'var(--den-500-text, #3F6212)', borderColor: 'var(--den-500-border, #D9F99D)' },
  // Pièces UEMOA
  { value: 500, label: '500 Pièce', type: 'coin', color: '#CA8A04', bgLight: 'var(--den-coin-gold-bg, #FEFCE8)', textColor: 'var(--den-coin-gold-text, #854D0E)', borderColor: 'var(--den-coin-gold-border, #FEF08A)' },
  { value: 250, label: '250 Pièce', type: 'coin', color: '#475569', bgLight: 'var(--den-coin-slate-bg, #F8FAFC)', textColor: 'var(--den-coin-slate-text, #1E293B)', borderColor: 'var(--den-coin-slate-border, #CBD5E1)' },
  { value: 200, label: '200 Pièce', type: 'coin', color: '#D97706', bgLight: 'var(--den-coin-amber-bg, #FFFBEB)', textColor: 'var(--den-coin-amber-text, #92400E)', borderColor: 'var(--den-coin-amber-border, #FDE68A)' },
  { value: 100, label: '100 Pièce', type: 'coin', color: '#64748B', bgLight: 'var(--den-coin-slate-bg, #F1F5F9)', textColor: 'var(--den-coin-slate-text, #334155)', borderColor: 'var(--den-coin-slate-border, #CBD5E1)' },
  { value: 50, label: '50 Pièce', type: 'coin', color: '#64748B', bgLight: 'var(--den-coin-slate-bg, #F1F5F9)', textColor: 'var(--den-coin-slate-text, #334155)', borderColor: 'var(--den-coin-slate-border, #CBD5E1)' },
  { value: 25, label: '25 Pièce', type: 'coin', color: '#EAB308', bgLight: 'var(--den-coin-gold-bg, #FEF9C3)', textColor: 'var(--den-coin-gold-text, #713F12)', borderColor: 'var(--den-coin-gold-border, #FEF08A)' },
];

// Algorithme glouton pour décomposer un montant en coupures UEMOA
const calculateBreakdown = (amount: number): Record<string, number> => {
  let remaining = Math.max(0, amount);
  const result: Record<string, number> = {};
  UEMOA_DENOMINATIONS.forEach((d) => {
    result[`${d.value}_${d.type}`] = 0;
  });

  const order = [
    { val: 10000, type: 'note' },
    { val: 5000, type: 'note' },
    { val: 2000, type: 'note' },
    { val: 1000, type: 'note' },
    { val: 500, type: 'note' },
    { val: 500, type: 'coin' },
    { val: 200, type: 'coin' },
    { val: 100, type: 'coin' },
    { val: 50, type: 'coin' },
    { val: 25, type: 'coin' },
  ];

  order.forEach(({ val, type }) => {
    if (remaining >= val) {
      const count = Math.floor(remaining / val);
      result[`${val}_${type}`] = count;
      remaining -= count * val;
    }
  });

  return result;
};

export const CashBalanceScreen: React.FC<CashBalanceScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction: _onNewTransaction,
  onShowToast,
}) => {
  const { 
    cashBalance, 
    transactions, 
    recharges, 
    cashAudits, 
    cashMovements, 
    recordCashAudit, 
    recordCashMovement 
  } = useTransactions();

  const [activeTab, setActiveTab] = useState<TabMode>('calculator');
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

  // État de la calculatrice de caisse (quantité par coupure)
  // Prérempli automatiquement avec la décomposition du solde pour éviter les faux écarts
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    return calculateBreakdown(cashBalance);
  });

  // Modal d'ajustement / justification d'écart
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState('Erreur de rendu de monnaie');
  const [customReason, setCustomReason] = useState('');

  // Modal d'apport / retrait de fond de caisse
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'inflow' | 'outflow'>('inflow');
  const [movementAmount, setMovementAmount] = useState('50000');
  const [movementReason, setMovementReason] = useState('');
  const [movementError, setMovementError] = useState<string | null>(null);

  // Décompte physique total calculé
  const totalPhysicalCash = useMemo(() => {
    return UEMOA_DENOMINATIONS.reduce((sum, d) => {
      const qty = counts[`${d.value}_${d.type}`] || 0;
      return sum + d.value * qty;
    }, 0);
  }, [counts]);

  // Savoir si l'utilisateur a au moins un billet ou pièce compté
  const hasStartedCounting = useMemo(() => {
    return Object.values(counts).some((qty) => qty > 0);
  }, [counts]);

  // Écart entre décompte physique et solde théorique de l'application
  const discrepancy = totalPhysicalCash - cashBalance;

  // Totaux flux espèces du jour
  const todayCashStats = useMemo(() => {
    let cashInFromDeposits = 0;
    let cashOutFromWithdrawals = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'deposit') {
        // Dépôt : Le client donne des espèces au gérant
        cashInFromDeposits += tx.amount;
      } else {
        // Retrait : Le gérant donne des espèces au client
        cashOutFromWithdrawals += tx.amount;
      }
    });

    // Recharges de flotte payées en espèces
    const cashOutRecharges = recharges
      .filter((r) => r.paymentMethod === 'cash')
      .reduce((sum, r) => sum + r.amount, 0);

    // Apports / Retraits de fonds
    const inflows = cashMovements
      .filter((m) => m.type === 'inflow')
      .reduce((sum, m) => sum + m.amount, 0);

    const outflows = cashMovements
      .filter((m) => m.type === 'outflow')
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      cashInTotal: cashInFromDeposits + inflows,
      cashOutTotal: cashOutFromWithdrawals + cashOutRecharges + outflows,
      cashInFromDeposits,
      cashOutFromWithdrawals,
      cashOutRecharges,
    };
  }, [transactions, recharges, cashMovements]);

  // Gestion des quantités dans la calculatrice
  const handleUpdateCount = (key: string, delta: number) => {
    setCounts((prev) => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [key]: next };
    });
  };

  const handleSetCount = (key: string, value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    setCounts((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleResetCounts = () => {
    const reset: Record<string, number> = {};
    UEMOA_DENOMINATIONS.forEach((d) => {
      reset[`${d.value}_${d.type}`] = 0;
    });
    setCounts(reset);
  };

  // Préremplir avec la décomposition exacte du solde théorique
  const handleAutoFillTheoretical = () => {
    setCounts(calculateBreakdown(cashBalance));
    onShowToast?.('info', 'Calculatrice ajustée', 'Billets et pièces alignés sur le solde TIVO.');
  };

  // Validation du décompte
  const handleValidateAudit = () => {
    if (discrepancy !== 0) {
      // S'il y a un écart, ouvrir la modale de justification
      if (discrepancy > 0 && cashBalance === 0) {
        setAdjustmentReason('Fond de caisse de la journée (Argent apporté)');
      } else if (discrepancy > 0) {
        setAdjustmentReason('Fond de caisse de la journée (Argent apporté)');
      } else {
        setAdjustmentReason('Erreur de monnaie rendue au client');
      }
      setCustomReason('');
      setShowAdjustmentModal(true);
      return;
    }

    // Pas d'écart : enregistrement direct
    const breakdown: Record<number, number> = {};
    UEMOA_DENOMINATIONS.forEach((d) => {
      breakdown[d.value] = (breakdown[d.value] || 0) + (counts[`${d.value}_${d.type}`] || 0);
    });

    recordCashAudit({
      theoreticalBalance: cashBalance,
      physicalBalance: totalPhysicalCash,
      discrepancy: 0,
      reason: 'Caisse équilibrée sans écart',
      breakdown,
    });

    onShowToast?.(
      'success',
      'Décompte validé avec succès !',
      `Caisse parfaitement équilibrée à ${formatFCFA(totalPhysicalCash)}.`
    );
  };

  // Confirmation avec justification d'écart
  const handleConfirmAdjustment = () => {
    const finalReason = customReason.trim() || adjustmentReason;

    const breakdown: Record<number, number> = {};
    UEMOA_DENOMINATIONS.forEach((d) => {
      breakdown[d.value] = (breakdown[d.value] || 0) + (counts[`${d.value}_${d.type}`] || 0);
    });

    recordCashAudit({
      theoreticalBalance: cashBalance,
      physicalBalance: totalPhysicalCash,
      discrepancy,
      reason: finalReason,
      breakdown,
    });

    onShowToast?.(
      discrepancy < 0 ? 'warning' : 'info',
      'Solde de caisse synchronisé',
      `Caisse ajustée à ${formatFCFA(totalPhysicalCash)} (${discrepancy > 0 ? '+' : ''}${formatFCFA(discrepancy)}). Motif : ${finalReason}`
    );

    setShowAdjustmentModal(false);
  };

  // Ouvrir le modal de mouvement / fond de caisse
  const openMovementModal = (mode: 'fund' | 'inflow' | 'outflow' = 'fund') => {
    if (mode === 'fund') {
      setMovementType('inflow');
      setMovementAmount(cashBalance > 0 ? String(cashBalance) : '50000');
      setMovementReason('Fond de caisse de la journée');
    } else if (mode === 'inflow') {
      setMovementType('inflow');
      setMovementAmount('50000');
      setMovementReason('Ajout de sous en caisse');
    } else {
      setMovementType('outflow');
      setMovementAmount('50000');
      setMovementReason('Retrait vers coffre ou banque');
    }
    setMovementError(null);
    setShowMovementModal(true);
  };

  const handleQuickFund = (amountNum: number) => {
    const res = recordCashMovement({
      type: 'inflow',
      amount: amountNum,
      reason: 'Fond de caisse de la journée',
    });
    if (res.success) {
      setCounts(calculateBreakdown(cashBalance + amountNum));
      onShowToast?.(
        'success',
        'Fond de caisse enregistré !',
        `+${formatFCFA(amountNum)} enregistrés pour démarrer la journée.`
      );
    }
  };

  // Validation d'un mouvement de fond de caisse
  const handleConfirmMovement = () => {
    const amountNum = parseInt(movementAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMovementError('Veuillez entrer un montant valide');
      return;
    }

    const defaultReason = movementType === 'inflow' 
      ? (movementReason.includes('Fond de caisse') ? 'Fond de caisse de la journée' : 'Ajout de sous en caisse')
      : 'Retrait vers coffre ou banque';

    const finalReason = movementReason.trim() || defaultReason;

    const res = recordCashMovement({
      type: movementType,
      amount: amountNum,
      reason: finalReason,
    });

    if (!res.success) {
      setMovementError(res.error || 'Erreur lors de l\'enregistrement');
      return;
    }

    const newCash = movementType === 'inflow' ? cashBalance + amountNum : Math.max(0, cashBalance - amountNum);
    setCounts(calculateBreakdown(newCash));

    onShowToast?.(
      'success',
      finalReason.includes('Fond de caisse') ? 'Fond de caisse enregistré !' : (movementType === 'inflow' ? 'Sous ajoutés en caisse' : 'Sous retirés de la caisse'),
      `${movementType === 'inflow' ? '+' : '−'}${formatFCFA(amountNum)} sur la caisse physique.`
    );

    setShowMovementModal(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        <TivoHeader
          title="Argent liquide (Caisse)"
          subtitle="Compter les billets et pièces de la caisse"
          showBack
          onBack={onBack}
          rightAction={
            <button
              onClick={() => openMovementModal('fund')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Fond de caisse</span>
            </button>
          }
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4">
          
          {/* ======================================================== */}
          {/* 2. HERO SOLDE CAISSE THEORIQUE (Design Sobre Fintech) */}
          {/* ======================================================== */}
          <div className="relative bg-emerald-800 dark:bg-emerald-900/90 rounded-2xl p-5 text-white shadow-sm border border-emerald-700/40">
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-200" />
                Argent liquide dans le tiroir
              </span>
              <button
                onClick={toggleHideBalances}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={hideBalances ? 'Afficher' : 'Masquer'}
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative z-10 mt-2 flex items-baseline gap-2 min-w-0">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono truncate min-w-0" title={hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}>
                {hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}
              </span>
            </div>

            <p className="relative z-10 text-xs text-emerald-100/90 mt-1 truncate">
              Argent physique disponible dans votre caisse
            </p>

            {/* Statistiques des flux d'espèces du jour */}
            <div className="relative z-10 mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div className="bg-white/10 rounded-xl p-2 min-w-0">
                <span className="text-[10px] text-emerald-100 uppercase tracking-wider flex items-center gap-1 truncate">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-200 shrink-0" />
                  <span className="truncate">Sous entrés en caisse</span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-white font-mono mt-0.5 block truncate" title={hideBalances ? '•••••• FCFA' : `+${formatFCFA(todayCashStats.cashInTotal)}`}>
                  {hideBalances ? '•••••• FCFA' : `+${formatFCFA(todayCashStats.cashInTotal)}`}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-2 min-w-0">
                <span className="text-[10px] text-rose-100 uppercase tracking-wider flex items-center gap-1 truncate">
                  <ArrowUpRight className="w-3 h-3 text-rose-200 shrink-0" />
                  <span className="truncate">Sous sortis de la caisse</span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-white font-mono mt-0.5 block truncate" title={hideBalances ? '•••••• FCFA' : `−${formatFCFA(todayCashStats.cashOutTotal)}`}>
                  {hideBalances ? '•••••• FCFA' : `−${formatFCFA(todayCashStats.cashOutTotal)}`}
                </span>
              </div>
            </div>

            {/* Boutons d'action rapides Fond de caisse / Ajouter ou Retirer */}
            <div className="relative z-10 mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openMovementModal('fund')}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Mettre le fond de caisse</span>
              </button>
              <button
                type="button"
                onClick={() => openMovementModal('inflow')}
                className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                title="Ajouter ou Retirer des sous"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter / Retirer</span>
              </button>
            </div>
          </div>

          {/* Bannière d'aide si caisse vide */}
          {cashBalance === 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs min-w-0">
                <span className="font-bold block text-sm text-emerald-800 dark:text-emerald-300">
                  Votre caisse est à 0 FCFA
                </span>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                  Si vous avez apporté des sous pour démarrer le matin (rendre la monnaie), enregistrez votre fond de caisse :
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openMovementModal('fund')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Définir le montant</span>
                  </button>
                  {[25000, 50000, 100000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => handleQuickFund(quickAmt)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] shadow-xs active:scale-95 transition-all"
                    >
                      +{formatFCFA(quickAmt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. TABS SEGMENTÉS */}
          {/* ======================================================== */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Compter billets & pièces</span>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'movements'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="truncate">Entrées & Sorties</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-extrabold shrink-0">
                {cashMovements.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Anciens comptages ({cashAudits.length})</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 4. CONTENU DE L'ONGLET 1 : CALCULATRICE DE CAISSE UEMOA */}
          {/* ======================================================== */}
          {activeTab === 'calculator' && (
            <div className="flex flex-col gap-4">
              
              {/* Actions d'aide de la calculatrice */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Billets et pièces FCFA
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoFillTheoretical}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    title="Décomposer automatiquement le solde théorique"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Remplir automatiquement</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    onClick={handleResetCounts}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    title="Remettre les compteurs à zéro"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Remettre à zéro</span>
                  </button>
                </div>
              </div>

              {/* LISTE DES COUPURES PAR CARTE */}
              <div className="flex flex-col gap-3.5">
                {UEMOA_DENOMINATIONS.map((den) => {
                  const key = `${den.value}_${den.type}`;
                  const qty = counts[key] || 0;
                  const subtotal = den.value * qty;

                  return (
                    <TivoCard
                      key={key}
                      variant="default"
                      className="p-2.5 sm:p-3.5 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* En-tête de la coupure */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 border"
                          style={{
                            backgroundColor: den.bgLight,
                            color: den.textColor,
                            borderColor: den.borderColor,
                          }}
                        >
                          {den.type === 'note' ? (
                            <div className="flex flex-col items-center leading-none">
                              <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                              <span className="text-[8.5px] sm:text-[9px] font-mono">{den.value >= 1000 ? `${den.value / 1000}k` : den.value}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center leading-none">
                              <Coins className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                              <span className="text-[8.5px] sm:text-[9px] font-mono">{den.value}</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {den.value.toLocaleString()} FCFA
                            </span>
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 shrink-0 whitespace-nowrap">
                              {den.type === 'note' ? 'Billet' : 'Pièce'}
                            </span>
                          </div>
                          <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block truncate" title={hideBalances ? '= •••••• FCFA' : `= ${formatFCFA(subtotal)}`}>
                            {hideBalances ? '= •••••• FCFA' : `= ${formatFCFA(subtotal)}`}
                          </span>
                        </div>
                      </div>

                      {/* Contrôleur de quantité (Incrément / Décrément + Saisie) */}
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(key, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all shrink-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={qty === 0 ? '' : qty}
                          onChange={(e) => handleSetCount(key, e.target.value)}
                          placeholder="0"
                          className="w-10 sm:w-12 h-7 sm:h-8 text-center font-mono font-black text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                        />

                        <button
                          type="button"
                          onClick={() => handleUpdateCount(key, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center active:scale-95 transition-all shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Raccourci rapide +5 pour gros billets */}
                        {den.type === 'note' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateCount(key, 5)}
                            className="hidden sm:flex px-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                            title="Ajouter 5 billets"
                          >
                            +5
                          </button>
                        )}
                      </div>
                    </TivoCard>
                  );
                })}
              </div>

              {/* ======================================================== */}
              {/* PANNEAU FIXE DE SYNCHRONISATION & BILAN DE COMPTAGE */}
              {/* ======================================================== */}
              <div className="sticky bottom-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xl flex flex-col gap-2.5 sm:gap-3">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block truncate">Calculé par TIVO</span>
                    <span className="text-[11px] sm:text-xs md:text-sm font-black text-slate-700 dark:text-slate-300 font-mono block mt-0.5 truncate" title={hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}>
                      {hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block truncate">Compté en main</span>
                    <span className="text-[11px] sm:text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5 truncate" title={hideBalances ? '•••••• FCFA' : formatFCFA(totalPhysicalCash)}>
                      {hideBalances ? '•••••• FCFA' : formatFCFA(totalPhysicalCash)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block truncate">Différence</span>
                    <span className={`text-[11px] sm:text-xs md:text-sm font-black font-mono block mt-0.5 truncate ${
                      !hasStartedCounting && cashBalance > 0
                        ? 'text-slate-400 dark:text-slate-500'
                        : discrepancy === 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : discrepancy < 0 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`} title={!hasStartedCounting && cashBalance > 0 ? '-- FCFA' : (hideBalances ? '•••••• FCFA' : (discrepancy > 0 ? `+${formatFCFA(discrepancy)}` : formatFCFA(discrepancy)))}>
                      {!hasStartedCounting && cashBalance > 0 ? '-- FCFA' : (hideBalances ? '•••••• FCFA' : (discrepancy > 0 ? `+${formatFCFA(discrepancy)}` : formatFCFA(discrepancy)))}
                    </span>
                  </div>
                </div>

                {/* Statut d'écart */}
                <div className="flex items-center justify-between text-xs min-w-0">
                  {!hasStartedCounting && cashBalance > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold truncate">
                      <Info className="w-4 h-4 shrink-0" />
                      <span className="truncate">Comptage remis à zéro — Indiquez vos billets ci-dessus</span>
                    </span>
                  ) : discrepancy === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{hideBalances ? 'Caisse exacte (Pas de différence)' : 'Caisse exacte (0 FCFA de différence)'}</span>
                    </span>
                  ) : discrepancy < 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold animate-pulse truncate">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="truncate">{hideBalances ? 'Manquant : Il manque des sous' : `Manquant : Il manque ${formatFCFA(Math.abs(discrepancy))}`}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold truncate">
                      <Info className="w-4 h-4 shrink-0" />
                      <span className="truncate">{hideBalances ? 'En trop : Surplus constaté' : `En trop : +${formatFCFA(discrepancy)} de surplus`}</span>
                    </span>
                  )}
                </div>

                {/* Bouton de synchronisation */}
                {!hasStartedCounting && cashBalance > 0 ? (
                  <TivoButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAutoFillTheoretical}
                    className="btn-press shadow-tivo-md text-xs sm:text-sm truncate"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span className="truncate">Remplir les billets selon TIVO ({hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)})</span>
                  </TivoButton>
                ) : (
                  <TivoButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleValidateAudit}
                    className="btn-press shadow-tivo-md text-xs sm:text-sm truncate"
                  >
                    {discrepancy === 0 ? (
                      <span className="truncate">Confirmer le comptage (Caisse exacte)</span>
                    ) : (
                      <span className="truncate">{hideBalances ? 'Régler la différence de caisse' : `Régler la différence (${discrepancy > 0 ? '+' : ''}${formatFCFA(discrepancy)})`}</span>
                    )}
                  </TivoButton>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 5. CONTENU DE L'ONGLET 2 : MOUVEMENTS DE CAISSE */}
          {/* ======================================================== */}
          {activeTab === 'movements' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Ajouter ou Retirer de l'argent dans la caisse
                </span>
                <button
                  onClick={() => {
                    setMovementAmount('50000');
                    setMovementReason('');
                    setMovementError(null);
                    setShowMovementModal(true);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Entrée ou Sortie</span>
                </button>
              </div>

              {cashMovements.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <Coins className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun ajout ni retrait enregistré</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Notez ici quand vous mettez de l'argent dans la caisse le matin ou quand vous en enlevez pour garder en lieu sûr.
                  </p>
                  <button
                    onClick={() => setShowMovementModal(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                  >
                    + Noter un ajout ou retrait d'argent
                  </button>
                </div>
              ) : (
                cashMovements.map((mov) => (
                  <TivoCard key={mov.id} variant="default" className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${
                        mov.type === 'inflow'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {mov.type === 'inflow' ? <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {mov.reason}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold shrink-0 ${
                            mov.type === 'inflow'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}>
                            {mov.type === 'inflow' ? 'Argent ajouté' : 'Argent retiré'}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">
                          {mov.timeStr} • {mov.dateStr}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs sm:text-sm md:text-base font-black font-mono shrink-0 ml-2 ${
                      mov.type === 'inflow'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {hideBalances ? '•••••• FCFA' : `${mov.type === 'inflow' ? '+' : '−'}${formatFCFA(mov.amount)}`}
                    </span>
                  </TivoCard>
                ))
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. CONTENU DE L'ONGLET 3 : HISTORIQUE DES DECOMPTES */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Historique des comptages ({cashAudits.length})
              </span>

              {cashAudits.map((audit) => (
                <TivoCard key={audit.id} variant="default" className="p-3 sm:p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        audit.discrepancy === 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : audit.discrepancy < 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                          {audit.reason || 'Comptage des billets et pièces'}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                          {audit.timeStr} • {audit.dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono block">
                        {hideBalances ? '•••••• FCFA' : formatFCFA(audit.physicalBalance)}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-bold block ${
                        audit.discrepancy === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : audit.discrepancy < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {hideBalances
                          ? (audit.discrepancy === 0 ? 'Caisse exacte' : 'Écart ajusté')
                          : (audit.discrepancy === 0 ? 'Caisse exacte (0 FCFA)' : `Différence : ${audit.discrepancy > 0 ? '+' : ''}${formatFCFA(audit.discrepancy)}`)}
                      </span>
                    </div>
                  </div>

                  {/* Résumé de l'état avant/après */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] sm:text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 gap-1">
                    <span className="truncate">Attendu : {hideBalances ? '•••••• FCFA' : formatFCFA(audit.theoreticalBalance)}</span>
                    <span className="shrink-0">→</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">Compté : {hideBalances ? '•••••• FCFA' : formatFCFA(audit.physicalBalance)}</span>
                  </div>
                </TivoCard>
              ))}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* 7. MODAL JUSTIFICATION D'ÉCART */}
        {/* ======================================================== */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
                    discrepancy < 0 ? 'bg-rose-600' : 'bg-blue-600'
                  }`}>
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Régler la différence de caisse
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mettre le solde TIVO au même montant que vos billets et pièces
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bilan de l'écart */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                discrepancy < 0 
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200' 
                  : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
              }`}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">
                    {discrepancy < 0 ? 'Argent manquant' : 'Argent en trop'} : {hideBalances ? '•••••• FCFA' : `${discrepancy > 0 ? '+' : ''}${formatFCFA(discrepancy)}`}
                  </span>
                  <p className="mt-0.5">
                    Calculé dans Tivo : <strong>{hideBalances ? '•••••• FCFA' : formatFCFA(cashBalance)}</strong> → Compté en main : <strong>{hideBalances ? '•••••• FCFA' : formatFCFA(totalPhysicalCash)}</strong>
                  </p>
                </div>
              </div>

              {/* Sélection d'un motif fréquent */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Pourquoi cette différence ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(discrepancy > 0
                    ? [
                        'Fond de caisse de la journée (Argent apporté)',
                        'Cadeau (pourboire) ou surplus laissé',
                        'Bénéfice ou commission non notée',
                        'Erreur de monnaie rendue',
                        'Autre explication',
                      ]
                    : [
                        'Erreur de monnaie rendue au client',
                        'Petite dépense faite sans l\'enregistrer',
                        'Bénéfice retiré ou prélèvement',
                        'Perte ou vol constaté',
                        'Autre explication',
                      ]
                  ).map((mot) => (
                    <button
                      key={mot}
                      type="button"
                      onClick={() => setAdjustmentReason(mot)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        adjustmentReason === mot
                          ? 'border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {mot}
                    </button>
                  ))}
                </div>
              </div>

              {adjustmentReason === 'Autre explication' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Précisez la raison :
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Ex: Facture électricité payée en espèces..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Annuler
                </button>
                <TivoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex-1"
                  onClick={handleConfirmAdjustment}
                >
                  Valider et ajuster la caisse
                </TivoButton>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. MODAL APPORT / RETRAIT DE FOND DE CAISSE */}
        {/* ======================================================== */}
        {showMovementModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Mettre le fond de caisse ou Ajouter/Retirer
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enregistrer l'argent de démarrage du matin ou un mouvement
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type de mouvement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMovementType('inflow');
                    setMovementReason('Fond de caisse de la journée');
                  }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    movementType === 'inflow' && movementReason.includes('Fond de caisse')
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Fond de caisse (Matin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMovementType('inflow');
                    setMovementReason('Ajout de sous en caisse');
                  }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    movementType === 'inflow' && !movementReason.includes('Fond de caisse')
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>Ajouter des sous (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMovementType('outflow');
                    setMovementReason('Retrait vers coffre ou banque');
                  }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    movementType === 'outflow'
                      ? 'border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Retirer des sous (−)</span>
                </button>
              </div>

              {/* Montant */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Combien d'argent ? (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={movementAmount}
                    onChange={(e) => {
                      setMovementAmount(sanitizeAmountInput(e.target.value));
                      setMovementError(null);
                    }}
                    placeholder="50 000"
                    className="w-full text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 pr-16 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {[25000, 50000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMovementAmount(String(val))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-semibold transition-colors"
                    >
                      +{formatFCFA(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motif */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Pourquoi ? (Explication)
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder={movementType === 'inflow' ? 'Ex: Argent du matin pour démarrer...' : 'Ex: Déposé à la banque ou dans le coffre...'}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {movementError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{movementError}</span>
                </div>
              )}

              {/* Boutons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Annuler
                </button>
                <TivoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex-1"
                  onClick={handleConfirmMovement}
                >
                  Valider et enregistrer
                </TivoButton>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. BOTTOM NAVIGATION */}
        {/* ======================================================== */}
        <TivoBottomNav
          activeTab="home"
          onTabChange={onNavigateTab}
          onAddClick={() => openMovementModal('fund')}
        />
      </div>
    </div>
  );
};
