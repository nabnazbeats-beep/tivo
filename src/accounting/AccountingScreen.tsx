import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  Layers
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { TIVO_NETWORKS } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { calculateFees } from '../tariffs/tariffData';

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface AccountingScreenProps {
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onOpenTariffs?: () => void;
}

export const AccountingScreen: React.FC<AccountingScreenProps> = ({
  onNavigateTab,
  onNewTransaction,
  onOpenTariffs,
}) => {
  const { transactions, networkBalances, cashBalance, totalMobileMoneyBalance } = useTransactions();
  const [period, setPeriod] = useState<PeriodType>('day');

  // Filtrage selon la période sélectionnée
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      if (isNaN(txDate.getTime())) return true; // fallback

      if (period === 'day') {
        // Transactions d'aujourd'hui
        return (
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      } else if (period === 'week') {
        // 7 derniers jours
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (period === 'month') {
        // Ce mois-ci
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      } else if (period === 'year') {
        // Cette année
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period]);

  // Calculs synthétiques de la période
  const stats = useMemo(() => {
    let depositsTotal = 0;
    let withdrawalsTotal = 0;
    let depositsCount = 0;
    let withdrawalsCount = 0;
    let commissionsTotal = 0;

    // Répartition par réseau
    const networkVolumes: Record<string, { total: number; deposits: number; withdrawals: number; count: number }> = {};
    TIVO_NETWORKS.forEach((net) => {
      networkVolumes[net.id] = { total: 0, deposits: 0, withdrawals: 0, count: 0 };
    });

    filteredTransactions.forEach((tx) => {
      const comm = tx.estimatedCommission ?? calculateFees(tx.networkId, tx.type, tx.amount).agentCommission;
      commissionsTotal += comm;

      if (tx.type === 'deposit') {
        depositsTotal += tx.amount;
        depositsCount++;
      } else {
        withdrawalsTotal += tx.amount;
        withdrawalsCount++;
      }

      if (!networkVolumes[tx.networkId]) {
        networkVolumes[tx.networkId] = { total: 0, deposits: 0, withdrawals: 0, count: 0 };
      }
      networkVolumes[tx.networkId].total += tx.amount;
      networkVolumes[tx.networkId].count++;
      if (tx.type === 'deposit') {
        networkVolumes[tx.networkId].deposits += tx.amount;
      } else {
        networkVolumes[tx.networkId].withdrawals += tx.amount;
      }
    });

    const netVariation = depositsTotal - withdrawalsTotal;
    const totalVolume = depositsTotal + withdrawalsTotal;

    return {
      depositsTotal,
      withdrawalsTotal,
      depositsCount,
      withdrawalsCount,
      commissionsTotal,
      totalCount: filteredTransactions.length,
      netVariation,
      totalVolume,
      networkVolumes,
    };
  }, [filteredTransactions]);

  const periodLabels = {
    day: "Aujourd'hui",
    week: 'Cette semaine (7 jours)',
    month: 'Ce mois-ci',
    year: 'Cette année (2026)',
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER COMPTABILITÉ */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-100 font-bold block">
                Suivi de vos sous
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Comptes & Bilan</span>
                <BarChart3 className="w-6 h-6 text-cyan-300" />
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>En ligne</span>
            </div>
          </div>

          {/* SÉLECTEUR DE PÉRIODE (Jour / Semaine / Mois / Année) */}
          <div className="relative z-10 bg-white/15 backdrop-blur-md p-1 rounded-2xl flex items-center border border-white/20">
            {(['day', 'week', 'month', 'year'] as PeriodType[]).map((p) => {
              const labels: Record<PeriodType, string> = {
                day: 'Jour',
                week: 'Semaine',
                month: 'Mois',
                year: 'Année',
              };
              const isActive = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CORPS DU BILAN FINANCIER */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 -mt-4 relative z-20 flex flex-col gap-4 flex-1">
          
          {/* CARTE HERO : VARIATION NETTE DE LA PÉRIODE */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-tivo-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Point de la période • {periodLabels[period]}
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                {stats.totalCount} opération{stats.totalCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    stats.netVariation >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stats.netVariation >= 0 ? '+' : ''}
                  {formatFCFA(stats.netVariation)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Différence (Argent envoyé − Argent retiré)
                </span>
              </div>

              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  stats.netVariation >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                }`}
              >
                {stats.netVariation >= 0 ? (
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
            </div>

            {/* Barre de comparaison des flux Dépôts vs Retraits */}
            {stats.totalVolume > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Envoyé {Math.round((stats.depositsTotal / stats.totalVolume) * 100)}%
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Retiré {Math.round((stats.withdrawalsTotal / stats.totalVolume) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${(stats.depositsTotal / stats.totalVolume) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-300"
                    style={{
                      width: `${(stats.withdrawalsTotal / stats.totalVolume) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* DEUX GRANDES CARTES : TOTAL DÉPÔTS & TOTAL RETRAITS */}
          <section className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Carte Dépôts */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                  {stats.depositsCount} op.
                </span>
              </div>
              <div className="min-w-0">
                <span 
                  className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white block leading-tight truncate"
                  title={formatFCFA(stats.depositsTotal, false)}
                >
                  {formatFCFA(stats.depositsTotal, false)}
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mt-0.5 truncate">
                  Total Envoyé (Dépôts)
                </span>
              </div>
            </div>

            {/* Carte Retraits */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                  {stats.withdrawalsCount} op.
                </span>
              </div>
              <div className="min-w-0">
                <span 
                  className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white block leading-tight truncate"
                  title={formatFCFA(stats.withdrawalsTotal, false)}
                >
                  {formatFCFA(stats.withdrawalsTotal, false)}
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block mt-0.5 truncate">
                  Total Donné (Retraits)
                </span>
              </div>
            </div>
          </section>

          {/* CARTE COMMISSIONS GÉRANT ESTIMÉES (PHASE 16) */}
          <section className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between shadow-sm gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                💰
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  Vos Bénéfices réalisés
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  Votre part d'argent gagnée ({periodLabels[period]})
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                +{formatFCFA(stats.commissionsTotal)}
              </span>
              {onOpenTariffs && (
                <button
                  type="button"
                  onClick={onOpenTariffs}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline"
                >
                  Voir les tarifs & gains →
                </button>
              )}
            </div>
          </section>

          {/* TRÉSORERIE ACTUELLE DU POINT (Mobile Money & Espèces) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Tout votre argent réuni (Téléphones + Caisse)</span>
              <span className="text-[11px] text-blue-600 font-semibold">En direct</span>
            </h2>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
              {/* Solde Total Mobile Money */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 truncate">
                  <Smartphone className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate">Dans les téléphones</span>
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white block mt-1 truncate">
                  {formatFCFA(totalMobileMoneyBalance)}
                </span>
              </div>

              {/* Solde Espèces Physique */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 truncate">
                  <Wallet className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">Dans le tiroir (Caisse)</span>
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white block mt-1 truncate">
                  {formatFCFA(cashBalance)}
                </span>
              </div>
            </div>

            {/* Total Actif Net */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Total de tout votre argent :
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {formatFCFA(totalMobileMoneyBalance + cashBalance)}
              </span>
            </div>
          </section>

          {/* RÉPARTITION PAR RÉSEAU AVEC BARRES DE PROGRESSION */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Détail par opérateur (MoMo, Moov, Celtis)
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">
                {periodLabels[period]}
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {TIVO_NETWORKS.map((net) => {
                const vol = stats.networkVolumes[net.id] || { total: 0, deposits: 0, withdrawals: 0, count: 0 };
                const sharePercent = stats.totalVolume > 0 ? Math.round((vol.total / stats.totalVolume) * 100) : 0;
                const currentBalance = networkBalances[net.id] || 0;

                return (
                  <div key={net.id} className="flex flex-col gap-1.5">
                    {/* Header de l'opérateur */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: net.color }}
                        />
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {net.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({vol.count} op.)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatFCFA(vol.total)}
                        </span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: net.badgeBg,
                            color: net.textColor,
                            borderColor: net.borderColor,
                          }}
                        >
                          {sharePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression avec la couleur officielle du réseau */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(sharePercent, 3)}%`,
                          backgroundColor: net.color,
                        }}
                      />
                    </div>

                    {/* Sous-détails : Solde actuel & flux */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Sur ce téléphone : <strong className="text-slate-700 dark:text-slate-300">{formatFCFA(currentBalance)}</strong></span>
                      <span>+{formatFCFA(vol.deposits, false)} envoyé / −{formatFCFA(vol.withdrawals, false)} retiré</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>

        {/* NAVIGATION BASSE MOBILE (Onglet Compta Actif) */}
        <TivoBottomNav
          activeTab="accounting"
          onTabChange={(tab) => onNavigateTab(tab)}
          onAddClick={onNewTransaction}
        />

      </div>
    </div>
  );
};
