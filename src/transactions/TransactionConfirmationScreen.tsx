import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  Wallet, 
  User as UserIcon, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Receipt
} from 'lucide-react';
import { NewTransactionData } from './NewTransactionScreen';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoLoader } from '../design-system/components/TivoLoader';
import { calculateFees } from '../tariffs/tariffData';
import { TransactionInvoiceModal } from './TransactionInvoiceModal';

interface TransactionConfirmationScreenProps {
  data: NewTransactionData;
  onBack: () => void;
  onConfirmSuccess: () => void;
}

export const TransactionConfirmationScreen: React.FC<TransactionConfirmationScreenProps> = ({
  data,
  onBack,
  onConfirmSuccess,
}) => {
  const { networkBalances, cashBalance, addTransaction } = useTransactions();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const network: NetworkConfig = 
    TIVO_NETWORKS.find((n) => n.id === data.networkId) || TIVO_NETWORKS[0];

  const currentNetworkBalance = networkBalances[data.networkId] || 0;
  const isDeposit = data.type === 'deposit';

  // Calculs des soldes avant/après
  const nextNetworkBalance = isDeposit 
    ? currentNetworkBalance - data.amount 
    : currentNetworkBalance + data.amount;

  const nextCashBalance = isDeposit 
    ? cashBalance + data.amount 
    : cashBalance - data.amount;

  // Calcul des frais et commission kiosque (Phase 16)
  const fees = calculateFees(data.networkId, data.type, data.amount);

  // Date / heure courante
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [confirmedTx, setConfirmedTx] = useState<Transaction | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const handleConfirm = async () => {
    setIsProcessing(true);

    // Simulation de traitement sécurisé (600ms) avec TivoLoader
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = addTransaction({
      type: data.type,
      networkId: data.networkId,
      amount: data.amount,
      clientPhone: data.clientPhone,
      clientName: data.clientName || undefined,
      source: 'manual',
    });

    setIsProcessing(false);

    if (result.success && result.transaction) {
      setConfirmedTx(result.transaction);
    } else if (result.success) {
      onConfirmSuccess();
    }
  };

  if (confirmedTx) {
    return (
      <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
        <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-10 flex flex-col justify-between">
          
          <header className="relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white pt-safe pb-10 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Opération validée avec succès !
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Réf: {confirmedTx.id} • Soldes du point mis à jour
            </p>
          </header>

          <main className="px-4 sm:px-6 -mt-6 relative z-20 flex flex-col gap-4 flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-tivo-md text-center space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Montant {confirmedTx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 truncate" title={formatFCFA(confirmedTx.amount)}>
                {formatFCFA(confirmedTx.amount)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                Client : {confirmedTx.clientPhone} {confirmedTx.clientName ? `(${confirmedTx.clientName})` : ''}
              </p>
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm" 
                style={{ backgroundColor: network.color, color: network.id === 'mtn' ? '#713F12' : '#FFFFFF' }}
              >
                {network.name}
              </div>
            </div>

            <div className="space-y-2.5 mt-auto pt-4">
              <TivoButton
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Receipt className="w-5 h-5" />}
                className="!bg-blue-600 hover:!bg-blue-700 shadow-tivo-md"
                onClick={() => setShowInvoiceModal(true)}
              >
                Télécharger la Facture / Reçu 🧾
              </TivoButton>

              <TivoButton
                variant="outline"
                size="lg"
                fullWidth
                onClick={onConfirmSuccess}
              >
                Terminer & Retour à l'accueil
              </TivoButton>
            </div>
          </main>

          <TransactionInvoiceModal
            transaction={confirmedTx}
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Loader plein écran lors du traitement */}
      {isProcessing && (
        <TivoLoader
          size="lg"
          label="Enregistrement sécurisé de la transaction..."
          fullScreen
        />
      )}

      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-10 flex flex-col">
        
        {/* HEADER DE CONFIRMATION */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              disabled={isProcessing}
              aria-label="Retour au formulaire"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Vérification requise</span>
            </div>
          </div>

          <div className="relative z-10 text-center">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-100/90 block mb-1">
              Écran de confirmation
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Confirmer l'opération
            </h1>
            <p className="text-xs text-blue-100 mt-1 max-w-sm mx-auto">
              Vérifiez attentivement les informations ci-dessous avant d'enregistrer définitivement la transaction.
            </p>
          </div>
        </header>

        {/* CORPS DE LA CONFIRMATION (Ticket de transaction) */}
        <main className="px-4 sm:px-6 -mt-4 relative z-20 flex flex-col gap-4 flex-1">
          
          {/* CARTE HERO MONTANT & TYPE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-tivo-md text-center flex flex-col items-center">
            {/* Badge type d'opération */}
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-black text-xs uppercase mb-3 ${
                isDeposit
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {isDeposit ? (
                <>
                  <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                  <span>DÉPÔT MOBILE MONEY</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  <span>RETRAIT MOBILE MONEY</span>
                </>
              )}
            </div>

            {/* Montant monumental */}
            <div className="my-1 min-w-0 max-w-full">
              <span
                className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight truncate block ${
                  isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
                title={`${isDeposit ? '+' : '−'} ${formatFCFA(data.amount)}`}
              >
                {isDeposit ? '+' : '−'} {formatFCFA(data.amount)}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {isDeposit ? 'Monnaie électronique envoyée au client' : 'Espèces physiques remises au client'}
            </p>
          </div>

          {/* CARTE DÉTAILS DE LA TRANSACTION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3.5 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              Détails du client & de l'opérateur
            </h2>

            {/* Réseau */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-blue-500" />
                Opérateur réseau :
              </span>
              <span
                className="font-bold px-2.5 py-0.5 rounded-lg text-xs"
                style={{
                  backgroundColor: network.badgeBg,
                  color: network.textColor,
                  border: `1px solid ${network.borderColor}`,
                }}
              >
                {network.name}
              </span>
            </div>

            {/* Numéro client */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-blue-500" />
                Numéro du client :
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono tracking-wide">
                {data.clientPhone}
              </span>
            </div>

            {/* Nom client */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium shrink-0">
                <UserIcon className="w-4 h-4 text-blue-500" />
                Nom du client :
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[250px] text-right" title={data.clientName || 'Non renseigné (anonyme)'}>
                {data.clientName || 'Non renseigné (anonyme)'}
              </span>
            </div>

            {/* Date et heure */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-500" />
                Date & Heure :
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {dateStr} à {timeStr}
              </span>
            </div>
          </div>

          {/* CARTE IMPACTS FINANCIERS SUR LES SOLDES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Impacts calculés sur vos soldes
            </h2>

            {/* Impact Solde Réseau */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: network.color }} />
                  Solde {network.name}
                </span>
                <span className={`font-extrabold ${isDeposit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isDeposit ? '−' : '+'} {formatFCFA(data.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                <span>Avant : {formatFCFA(currentNetworkBalance)}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Après : {formatFCFA(nextNetworkBalance)}
                </span>
              </div>
            </div>

            {/* Impact Solde Espèces */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  Solde Espèces en Caisse
                </span>
                <span className={`font-extrabold ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isDeposit ? '+' : '−'} {formatFCFA(data.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                <span>Avant : {formatFCFA(cashBalance)}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Après : {formatFCFA(nextCashBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* COMMISSION KIOSQUE ESTIMÉE (PHASE 16) */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                💰
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Gain Kiosque estimé (Commission)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Frais client : {fees.clientFee === 0 ? 'Gratuit (0 FCFA)' : formatFCFA(fees.clientFee)}
                </span>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              +{formatFCFA(fees.agentCommission)}
            </span>
          </div>

          {/* BOUTONS D'ACTION FINAUX */}
          <div className="flex flex-col gap-2.5 mt-2">
            <TivoButton
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isProcessing}
              onClick={handleConfirm}
              rightIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Confirmer et enregistrer
            </TivoButton>

            <TivoButton
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              disabled={isProcessing}
              onClick={onBack}
            >
              Modifier les informations
            </TivoButton>
          </div>

        </main>

      </div>
    </div>
  );
};
