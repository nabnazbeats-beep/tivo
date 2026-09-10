import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Trash2, 
  X, 
  ChevronRight, 
  ChevronDown,
  Wallet,
  ArrowDownLeft
} from 'lucide-react';
import { useTransactions, DebtRecord } from '../context/TransactionContext';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA, sanitizeAmountInput } from '../design-system/tokens/typography';

interface DebtsScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type FilterStatus = 'all' | 'active' | 'paid';

export const DebtsScreen: React.FC<DebtsScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  const { 
    debts, 
    totalDebtsAmount, 
    addDebt, 
    recordDebtRepayment, 
    deleteDebt 
  } = useTransactions();

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

  // Modal Nouvelle Avance
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+229 ');
  const [debtAmount, setDebtAmount] = useState('');
  const [networkId, setNetworkId] = useState('mtn');
  const [dueDate, setDueDate] = useState('Dans 3 jours');
  const [debtNotes, setDebtNotes] = useState('');

  // Modal Remboursement
  const [repaymentDebt, setRepaymentDebt] = useState<DebtRecord | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentNote, setRepaymentNote] = useState('');

  // Modal Suppression
  const [debtToDelete, setDebtToDelete] = useState<DebtRecord | null>(null);

  // Helper réseau
  const getNetwork = (id?: string): NetworkConfig => {
    return TIVO_NETWORKS.find((n) => n.id === id) || TIVO_NETWORKS[0];
  };

  // Statistiques globales
  const stats = useMemo(() => {
    const activeDebts = debts.filter((d) => d.status !== 'paid');
    const totalClientsCount = new Set(activeDebts.map((d) => d.clientPhone || d.clientName)).size;
    const totalRepaidAmount = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const fullyPaidCount = debts.filter((d) => d.status === 'paid').length;

    return {
      activeAmount: totalDebtsAmount,
      debtorCount: totalClientsCount,
      totalRepaid: totalRepaidAmount,
      totalCount: debts.length,
      activeCount: activeDebts.length,
      paidCount: fullyPaidCount,
    };
  }, [debts, totalDebtsAmount]);

  // Liste filtrée
  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      // Filtre statut
      if (statusFilter === 'active' && debt.status === 'paid') return false;
      if (statusFilter === 'paid' && debt.status !== 'paid') return false;

      // Filtre recherche nom / téléphone
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = debt.clientName.toLowerCase().includes(q);
        const matchesPhone = debt.clientPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
        const matchesNote = (debt.notes || '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesNote;
      }
      return true;
    });
  }, [debts, statusFilter, searchQuery]);

  // 1. Validation de l'ajout d'une nouvelle avance
  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(debtAmount.replace(/\D/g, ''), 10);

    if (!clientName.trim()) {
      onShowToast?.('warning', 'Nom requis', 'Veuillez saisir le nom du client.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      onShowToast?.('warning', 'Montant invalide', 'Veuillez renseigner un montant supérieur à 0 FCFA.');
      return;
    }

    const res = addDebt({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      amount: numAmount,
      networkId,
      dueDate,
      notes: debtNotes.trim(),
    });

    if (res.success) {
      onShowToast?.(
        'success',
        'Avance enregistrée',
        `L'avance de ${formatFCFA(numAmount)} pour ${clientName.trim()} a été ajoutée au carnet.`
      );
      // Réinitialiser formulaire
      setClientName('');
      setClientPhone('+229 ');
      setDebtAmount('');
      setDebtNotes('');
      setShowAddModal(false);
    }
  };

  // 2. Validation d'un remboursement
  const handleProcessRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentDebt) return;

    const numAmount = parseInt(repaymentAmount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      onShowToast?.('warning', 'Montant invalide', 'Le montant du remboursement doit être supérieur à 0.');
      return;
    }

    const res = recordDebtRepayment(repaymentDebt.id, numAmount, repaymentNote.trim());
    if (res.success) {
      const isSettled = numAmount >= repaymentDebt.remainingAmount;
      onShowToast?.(
        'success',
        isSettled ? 'Dette intégralement soldée ! 🎉' : 'Remboursement partiel validé',
        `${formatFCFA(numAmount)} encaissé en caisse espèces de la part de ${repaymentDebt.clientName}.`
      );
      setRepaymentDebt(null);
      setRepaymentAmount('');
      setRepaymentNote('');
    } else {
      onShowToast?.('error', 'Erreur de remboursement', res.error || 'Une erreur est survenue.');
    }
  };

  // 3. Confirmation de suppression
  const handleConfirmDelete = () => {
    if (!debtToDelete) return;
    deleteDebt(debtToDelete.id);
    onShowToast?.(
      'info',
      'Avance supprimée',
      `Le dossier d'avance de ${debtToDelete.clientName} a été retiré.`
    );
    setDebtToDelete(null);
  };

  // 4. Génération de relance WhatsApp
  const handleSendWhatsAppReminder = (debt: DebtRecord) => {
    const rawDigits = debt.clientPhone.replace(/\D/g, '');
    const cleanPhone = rawDigits.startsWith('229') ? rawDigits : `229${rawDigits}`;
    
    const message = `Bonjour ${debt.clientName}, sauf erreur de notre part, votre avance Mobile Money de ${formatFCFA(debt.amount)} auprès de notre agence Tivo a un reste à payer de *${formatFCFA(debt.remainingAmount)}* (échéance : ${debt.dueDate || 'bientôt'}).\n\nMerci de bien vouloir passer au kiosque pour régulariser votre compte. Belle journée à vous ! 🤝`;
    
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onShowToast?.('info', 'Relance WhatsApp', `Message prêt pour ${debt.clientName}.`);
  };

  // 5. Génération de relance SMS
  const handleSendSmsReminder = (debt: DebtRecord) => {
    const rawDigits = debt.clientPhone.replace(/\D/g, '');
    const cleanPhone = rawDigits.startsWith('229') ? rawDigits : `229${rawDigits}`;
    const message = `Rappel Tivo : Bonjour ${debt.clientName}, merci de régulariser votre avance en cours de ${formatFCFA(debt.remainingAmount)} au kiosque Tivo. Cordialement.`;
    
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = url;
    onShowToast?.('info', 'Relance SMS', `Application SMS ouverte pour ${debt.clientName}.`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* EN-TÊTE FIXE */}
        <TivoHeader
          title="Argent dehors (Crédits)"
          subtitle="Suivre l'argent prêté et les remboursements"
          showBack
          onBack={onBack}
          rightAction={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Noter un prêt</span>
            </button>
          }
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">

          {/* ======================================================== */}
          {/* 1. HERO CARTE STATISTIQUES DETTES & CRÉDITS */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-[#071325] via-[#0E2240] to-[#0A162B] text-white rounded-3xl border border-slate-700/80 p-5 shadow-lg relative overflow-hidden">
            
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Argent prêté non encore remboursé
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {stats.activeCount} crédit{stats.activeCount > 1 ? 's' : ''} en cours
              </span>
            </div>

            <div className="relative z-10 mb-4 min-w-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block truncate" title={formatFCFA(stats.activeAmount)}>
                {formatFCFA(stats.activeAmount)}
              </span>
              <span className="text-xs text-blue-100/75 font-medium truncate block">
                Total que les clients doivent vous rendre
              </span>
            </div>

            {/* Micro statistiques en 2 sous-colonnes sur fond glass feutré */}
            <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5 pt-3 border-t border-white/10 text-xs">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-white/10 min-w-0">
                <span className="text-[10px] text-blue-100/70 block font-semibold truncate">Personnes qui doivent</span>
                <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block font-mono truncate">
                  {stats.debtorCount} client{stats.debtorCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="bg-emerald-500/15 backdrop-blur-sm rounded-2xl p-2.5 sm:p-3 border border-emerald-500/30 min-w-0">
                <span className="text-[10px] text-emerald-300 block font-semibold truncate">Total déjà récupéré</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-300 mt-0.5 block font-mono truncate">
                  {formatFCFA(stats.totalRepaid)}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. BARRE D'ACTIONS : RECHERCHE & FILTRES */}
          {/* ======================================================== */}
          <div className="flex flex-col gap-2.5">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, téléphone (+229), motif..."
                className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Onglets de filtrage */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Toutes ({stats.totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                En cours ({stats.activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  statusFilter === 'paid'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Soldées ({stats.paidCount})
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. LISTE DES CARTES DE DETTES */}
          {/* ======================================================== */}
          <div className="flex flex-col gap-3.5 sm:gap-4">
            {filteredDebts.length > 0 ? (
              filteredDebts.map((debt) => {
                const network = getNetwork(debt.networkId);
                const percentPaid = Math.round((debt.paidAmount / debt.amount) * 100);
                const isPaid = debt.status === 'paid';
                const isExpanded = expandedDebtId === debt.id;

                return (
                  <div
                    key={debt.id}
                    className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm overflow-hidden ${
                      isPaid 
                        ? 'border-emerald-200 dark:border-emerald-950/60 opacity-90' 
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50'
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Header de la carte client */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          {/* Avatar Initiale */}
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : percentPaid > 0
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {debt.clientName.substring(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                                {debt.clientName}
                              </h3>
                              {isPaid && (
                                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] sm:text-[10px] font-bold shrink-0 whitespace-nowrap">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Soldé
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 min-w-0">
                              <span className="font-mono font-medium truncate">{debt.clientPhone}</span>
                              <span className="shrink-0">•</span>
                              <span className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: network.color }}
                                />
                                <span className="font-semibold text-[10px] sm:text-[11px]">{network.name}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reste à payer / Badge Statut */}
                        <div className="text-right shrink-0 ml-2">
                          <span
                            className={`text-sm sm:text-base md:text-lg font-black block leading-tight truncate ${
                              isPaid
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                            title={isPaid ? '0 FCFA' : formatFCFA(debt.remainingAmount)}
                          >
                            {isPaid ? '0 FCFA' : formatFCFA(debt.remainingAmount)}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider truncate">
                            {isPaid ? 'Entièrement payé' : `Sur ${formatFCFA(debt.amount)}`}
                          </span>
                        </div>
                      </div>

                      {/* Barre de progression du remboursement */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          <span>
                            Remboursé : <strong className="text-slate-800 dark:text-slate-200">{formatFCFA(debt.paidAmount)}</strong>
                          </span>
                          <span className={percentPaid === 100 ? 'text-emerald-600 font-bold' : ''}>
                            {percentPaid}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPaid
                                ? 'bg-emerald-500'
                                : percentPaid > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>

                      {/* Échéance & Notes */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] truncate">
                            Échéance : <strong className="text-slate-800 dark:text-slate-200">{debt.dueDate || 'Non définie'}</strong>
                          </span>
                        </div>
                        {debt.notes && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic max-w-[150px] sm:max-w-[200px] truncate shrink-0" title={debt.notes}>
                            « {debt.notes} »
                          </span>
                        )}
                      </div>

                      {/* ======================================================== */}
                      {/* BOUTONS D'ACTION (Remboursement direct, WhatsApp, SMS) */}
                      {/* ======================================================== */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2">
                        {/* Bouton Rembourser */}
                        {!isPaid ? (
                          <button
                            onClick={() => {
                              setRepaymentDebt(debt);
                              setRepaymentAmount(String(debt.remainingAmount));
                            }}
                            className="flex-1 h-9 sm:h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition-all min-w-0 truncate"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                            <span className="truncate">Encaisser le remboursement</span>
                          </button>
                        ) : (
                          <div className="flex-1 h-9 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 min-w-0 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="truncate">Dette entièrement payée</span>
                          </div>
                        )}

                        {/* Relance WhatsApp */}
                        <button
                          onClick={() => handleSendWhatsAppReminder(debt)}
                          disabled={isPaid}
                          className={`h-9 sm:h-10 px-2 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 border transition-all shrink-0 ${
                            isPaid
                              ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 active:scale-95'
                          }`}
                          title="Envoyer un rappel de paiement sur WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="hidden xs:inline">WhatsApp</span>
                        </button>

                        {/* Relance SMS */}
                        <button
                          onClick={() => handleSendSmsReminder(debt)}
                          disabled={isPaid}
                          className={`h-9 sm:h-10 px-2 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 border transition-all shrink-0 ${
                            isPaid
                              ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 active:scale-95'
                          }`}
                          title="Envoyer un rappel par SMS"
                        >
                          <Send className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden xs:inline">SMS</span>
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => setDebtToDelete(debt)}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
                          title="Supprimer ce dossier d'avance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Accordéon : Historique des règlements */}
                      {debt.payments && debt.payments.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          >
                            <span>Historique des paiements ({debt.payments.length})</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-blue-500/30">
                              {debt.payments.map((p) => (
                                <div key={p.id} className="text-[11px] flex items-center justify-between py-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">{p.dateStr} à {p.timeStr}</span>
                                    {p.note && <span className="text-slate-500 italic">({p.note})</span>}
                                  </div>
                                  <strong className="text-emerald-600 dark:text-emerald-400">
                                    +{formatFCFA(p.amount)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            ) : (
              /* ÉTAT VIDE */
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-3">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Aucune avance trouvée
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {searchQuery 
                    ? 'Aucun résultat ne correspond à votre recherche.' 
                    : 'Toutes les dettes sont soldées ou aucune avance n’a encore été enregistrée.'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700"
                >
                  + Créer une nouvelle avance client
                </button>
              </div>
            )}
          </div>

        </main>

        {/* BOTTOM NAV FIXE */}
        <TivoBottomNav
          activeTab="accounting"
          onTabChange={onNavigateTab}
          onAddClick={onNewTransaction}
        />

        {/* ======================================================== */}
        {/* MODAL 1 : NOUVELLE AVANCE CLIENT */}
        {/* ======================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Nouvelle Avance Client
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enregistrer un crédit ou dépôt différé
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDebt} className="space-y-4">
                {/* Nom du Client */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom & Prénom du Client *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Bio Guerra CHABI"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Numéro de Téléphone (WhatsApp / SMS)
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+229 97 00 11 22"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Montant de l'avance */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Montant de l'avance (FCFA) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(sanitizeAmountInput(e.target.value))}
                    placeholder="Ex: 25 000"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  {/* Raccourcis montants */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[5000, 10000, 20000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDebtAmount(String(preset))}
                        className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        +{formatFCFA(preset, false)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Réseau concerné */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Réseau associé
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIVO_NETWORKS.slice(0, 3).map((net) => (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setNetworkId(net.id)}
                        className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                          networkId === net.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: net.color }}
                        />
                        <span>{net.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Échéance */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date d'échéance convenue
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {['Demain', 'Dans 3 jours', 'Fin de semaine'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDueDate(d)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          dueDate === d
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Ou date personnalisée (ex: 15/09/2026)"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Notes / Motif */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Motif / Commentaire (Facultatif)
                  </label>
                  <input
                    type="text"
                    value={debtNotes}
                    onChange={(e) => setDebtNotes(e.target.value)}
                    placeholder="Ex: Avance ordonnance pharmacie, passe au kiosque le soir..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-tivo-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Enregistrer l'avance client</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2 : ENREGISTRER UN REMBOURSEMENT */}
        {/* ======================================================== */}
        {repaymentDebt && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Encaisser un Remboursement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Règlement client : {repaymentDebt.clientName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRepaymentDebt(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rappel du reste à payer */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-700 dark:text-amber-300 block">Reste à payer</span>
                  <span className="text-lg font-black text-amber-900 dark:text-amber-100">
                    {formatFCFA(repaymentDebt.remainingAmount)}
                  </span>
                </div>
                <div className="text-right text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  <span>Initial : {formatFCFA(repaymentDebt.amount)}</span>
                  <br />
                  <span>Déjà réglé : {formatFCFA(repaymentDebt.paidAmount)}</span>
                </div>
              </div>

              <form onSubmit={handleProcessRepayment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Montant remis en espèces (FCFA) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(sanitizeAmountInput(e.target.value))}
                    placeholder="Ex: 10 000"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />

                  {/* Raccourcis rapides */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setRepaymentAmount(String(repaymentDebt.remainingAmount))}
                      className="py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      ⚡ Tout solder ({formatFCFA(repaymentDebt.remainingAmount, false)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepaymentAmount(String(Math.round(repaymentDebt.remainingAmount / 2)))}
                      className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      50% ({formatFCFA(Math.round(repaymentDebt.remainingAmount / 2), false)})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Note / Modalité (Facultatif)
                  </label>
                  <input
                    type="text"
                    value={repaymentNote}
                    onChange={(e) => setRepaymentNote(e.target.value)}
                    placeholder="Ex: Remis en espèces au comptoir..."
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Wallet className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <span>
                    Ce montant sera automatiquement crédité dans votre <strong>tiroir-caisse d'espèces physique</strong> (+{formatFCFA(parseInt(repaymentAmount.replace(/\D/g, '') || '0', 10))}).
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-tivo-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Valider l'encaissement</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3 : CONFIRMATION DE SUPPRESSION */}
        {/* ======================================================== */}
        {debtToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Supprimer cette avance ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                Voulez-vous retirer le dossier de <strong>{debtToDelete.clientName}</strong> ({formatFCFA(debtToDelete.remainingAmount)} restant) ?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDebtToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
