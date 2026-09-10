import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  X, 
  Calendar, 
  RotateCcw,
  WifiOff,
  Receipt
} from 'lucide-react';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TivoButton } from '../design-system/components/TivoButton';
import { TransactionInvoiceModal } from './TransactionInvoiceModal';

interface HistoryScreenProps {
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onNavigateTab,
  onNewTransaction,
}) => {
  const { transactions } = useTransactions();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [invoiceTransaction, setInvoiceTransaction] = useState<Transaction | null>(null);

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Filtre par type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // 2. Filtre par réseau
      if (networkFilter !== 'all' && tx.networkId !== networkFilter) return false;

      // 3. Recherche textuelle (nom ou numéro)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = tx.clientName ? tx.clientName.toLowerCase().includes(query) : false;
        const matchPhone = tx.clientPhone ? tx.clientPhone.replace(/\s/g, '').includes(query.replace(/\s/g, '')) : false;
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, networkFilter, searchQuery]);

  // Regroupement des transactions par jour
  const groupedTransactions = useMemo(() => {
    const groups: { [dateStr: string]: Transaction[] } = {};

    filteredTransactions.forEach((tx) => {
      const dateKey = tx.dateStr || "Aujourd'hui";
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const getNetwork = (netId: string): NetworkConfig => {
    return TIVO_NETWORKS.find((n) => n.id === netId) || TIVO_NETWORKS[4];
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setNetworkFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'all' || networkFilter !== 'all';

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER HISTORIQUE */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-5 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-100 font-bold block">
                Journal des opérations
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Historique
              </h1>
            </div>

            <span className="px-3 py-1 rounded-full glass-pill text-xs font-bold text-white shadow-sm">
              {filteredTransactions.length} opération{filteredTransactions.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* BARRE DE RECHERCHE */}
          <div className="relative z-10 mt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-blue-200 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou numéro..."
                className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-md text-white placeholder:text-blue-100/70 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-blue-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. FILTRES MULTI-CRITÈRES */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 pt-4 pb-2 flex flex-col gap-2.5">
          
          {/* Filtres par Type (Tous / Dépôt / Retrait) */}
          <div className="flex items-center justify-between gap-2">
            <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl flex items-center gap-1 border border-slate-300/40 dark:border-slate-700/40 flex-1">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('deposit')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'deposit'
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Dépôts (+)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('withdrawal')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'withdrawal'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Retraits (−)
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                title="Réinitialiser les filtres"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtres par Réseau (Chips horizontaux) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setNetworkFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 border ${
                networkFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Tous les réseaux
            </button>
            {TIVO_NETWORKS.map((net) => {
              const isSelected = networkFilter === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setNetworkFilter(net.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: net.color }} />
                  <span>{net.code}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. LISTE DES TRANSACTIONS REGROUPÉES PAR JOUR */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-2 flex flex-col gap-5 flex-1">
          
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([dayLabel, txList]) => {
              // Calcul des sous-totaux du jour
              const dayDeposits = txList
                .filter((t) => t.type === 'deposit')
                .reduce((acc, t) => acc + t.amount, 0);
              const dayWithdrawals = txList
                .filter((t) => t.type === 'withdrawal')
                .reduce((acc, t) => acc + t.amount, 0);

              return (
                <section key={dayLabel} className="flex flex-col gap-2.5">
                  
                  {/* EN-TÊTE DU GROUPE DU JOUR */}
                  <div className="flex items-center justify-between gap-2 px-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                        {dayLabel}
                      </h2>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        ({txList.length})
                      </span>
                    </div>

                    <div className="text-[10px] font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      {dayDeposits > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{formatFCFA(dayDeposits, false)}
                        </span>
                      )}
                      {dayWithdrawals > 0 && (
                        <span className="text-rose-600 dark:text-rose-400">
                          −{formatFCFA(dayWithdrawals, false)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CARTE DES TRANSACTIONS DU JOUR */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                    {txList.map((tx) => {
                      const net = getNetwork(tx.networkId);
                      const isDeposit = tx.type === 'deposit';

                      return (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors gap-2"
                        >
                          {/* Gauche : Icône + Client / Numéro / Réseau */}
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
                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {tx.clientName || 'Client anonyme'}
                                </span>
                                {tx.isLocked && (
                                  <span
                                    title="Transaction clôturée (verrouillée)"
                                    className="text-slate-400 dark:text-slate-500 shrink-0"
                                  >
                                    <Lock className="w-3 h-3" />
                                  </span>
                                )}
                                {tx.isSynced === false && (
                                  <span
                                    title="Enregistré hors-ligne (en attente de synchronisation)"
                                    className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0"
                                  >
                                    <WifiOff className="w-2.5 h-2.5" />
                                    <span>Local</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px]">
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
                                <span className="text-slate-500 dark:text-slate-400 truncate">
                                  {tx.clientPhone}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                                  • {tx.timeStr}
                                </span>
                                {tx.source && tx.source !== 'manual' && (
                                  <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 rounded uppercase font-bold shrink-0">
                                    {tx.source}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Droite : Montant */}
                          <div className="text-right shrink-0 ml-2">
                            <span
                              className={`text-xs sm:text-sm md:text-base font-extrabold tracking-tight block leading-tight ${
                                isDeposit
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isDeposit ? '+' : '−'} {formatFCFA(tx.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                              {isDeposit ? 'Dépôt' : 'Retrait'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </section>
              );
            })
          ) : (
            /* ÉTAT VIDE ÉPURÉ */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <Search className="w-7 h-7 stroke-[1.8]" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {hasActiveFilters
                  ? 'Aucune transaction ne correspond aux critères'
                  : 'Aucune transaction enregistrée'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                {hasActiveFilters
                  ? 'Modifiez vos termes de recherche ou réinitialisez les filtres.'
                  : 'Enregistrez votre première opération pour la voir apparaître ici.'}
              </p>
              
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNewTransaction}
                  className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  Créer une transaction
                </button>
              )}
            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* 4. MODAL DÉTAIL D'UNE TRANSACTION CLIQUÉE */}
        {/* ======================================================== */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      selectedTransaction.type === 'deposit'
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-rose-500/15 text-rose-600'
                    }`}
                  >
                    {selectedTransaction.type === 'deposit' ? '+' : '−'}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Détails de l'opération
                    </h3>
                    <p className="text-xs text-slate-400">ID : {selectedTransaction.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Montant monumental du détail */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center my-3 border border-slate-200/50 dark:border-slate-700/50">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    selectedTransaction.type === 'deposit'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedTransaction.type === 'deposit' ? '+' : '−'} {formatFCFA(selectedTransaction.amount)}
                </span>
                <span className="text-xs text-slate-400 block mt-1 uppercase font-semibold">
                  {selectedTransaction.type === 'deposit' ? 'Dépôt Mobile Money' : 'Retrait Mobile Money'}
                </span>
              </div>

              {/* Grille des caractéristiques */}
              <div className="flex flex-col gap-2.5 text-xs my-4">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Opérateur :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getNetwork(selectedTransaction.networkId).name}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Numéro client :</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTransaction.clientPhone}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Nom client :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedTransaction.clientName || 'Non renseigné (anonyme)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Date et heure :</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedTransaction.dateStr} à {selectedTransaction.timeStr}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Source :</span>
                  <span className="font-bold uppercase text-blue-600 dark:text-blue-400">
                    {selectedTransaction.source}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Statut de clôture :</span>
                  <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    {selectedTransaction.isLocked ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>Clôturé (Verrouillé)</span>
                      </>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">En cours (Actif)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <TivoButton
                  variant="primary"
                  fullWidth
                  leftIcon={<Receipt className="w-4 h-4" />}
                  className="!bg-blue-600 hover:!bg-blue-700 shadow-md"
                  onClick={() => {
                    setInvoiceTransaction(selectedTransaction);
                    setShowInvoiceModal(true);
                  }}
                >
                  Télécharger la Facture / Reçu 🧾
                </TivoButton>

                <TivoButton
                  variant="outline"
                  fullWidth
                  onClick={() => setSelectedTransaction(null)}
                >
                  Fermer
                </TivoButton>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE TÉLÉCHARGEMENT & IMPRESSION DE LA FACTURE MULTI-FORMATS */}
        <TransactionInvoiceModal
          transaction={invoiceTransaction}
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceTransaction(null);
          }}
        />

        {/* NAVIGATION BASSE MOBILE (Onglet Historique Actif) */}
        <TivoBottomNav
          activeTab="history"
          onTabChange={(tab) => onNavigateTab(tab)}
          onAddClick={onNewTransaction}
        />

      </div>
    </div>
  );
};
