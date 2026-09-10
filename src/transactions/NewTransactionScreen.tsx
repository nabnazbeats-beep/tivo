import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Phone, 
  User as UserIcon, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Check, 
  ShieldAlert,
  Sparkles,
  Camera,
  MessageSquare
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useAgency } from '../context/AgencyContext';
import { TIVO_NETWORKS } from '../design-system/tokens/colors';
import { formatFCFA, sanitizeAmountInput, normalizePhoneNumber } from '../design-system/tokens/typography';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoField } from '../design-system/components/TivoField';
import { calculateFees } from '../tariffs/tariffData';

export interface NewTransactionData {
  type: 'deposit' | 'withdrawal';
  networkId: string;
  amount: number;
  clientPhone: string;
  clientName: string;
}

interface NewTransactionScreenProps {
  onBack: () => void;
  onSubmit: (data: NewTransactionData) => void;
  onOpenImport?: (initialTab?: 'photo' | 'paste') => void;
  preset?: {
    networkId?: string;
    type?: 'deposit' | 'withdrawal';
    amount?: number;
  } | null;
}

export const NewTransactionScreen: React.FC<NewTransactionScreenProps> = ({
  onBack,
  onSubmit,
  onOpenImport,
  preset,
}) => {
  const { networkBalances, cashBalance } = useTransactions();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useAgency();

  // Form states
  const [type, setType] = useState<'deposit' | 'withdrawal'>(preset?.type || 'deposit');
  const [networkId, setNetworkId] = useState<string>(preset?.networkId || 'mtn');
  const [rawAmount, setRawAmount] = useState<string>(preset?.amount ? preset.amount.toString() : '');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');

  // Solde du réseau sélectionné
  const currentNetwork = TIVO_NETWORKS.find((n) => n.id === networkId) || TIVO_NETWORKS[0];
  const networkBalance = networkBalances[networkId] || 0;
  const numericAmount = rawAmount ? parseInt(rawAmount, 10) : 0;

  // Estimation dynamique des frais et de la commission kiosque
  const feeEstimate = useMemo(() => {
    return calculateFees(networkId, type, numericAmount);
  }, [networkId, type, numericAmount]);

  // Détection automatique du réseau par préfixe béninois (assistance UX)
  useEffect(() => {
    const cleanPhone = phone.replace(/[\s\+\(\)\-]/g, '');
    let prefix = '';
    if (cleanPhone.startsWith('229') && cleanPhone.length >= 5) {
      prefix = cleanPhone.slice(3, 5);
    } else if (cleanPhone.length >= 2) {
      prefix = cleanPhone.slice(0, 2);
    }

    if (prefix) {
      // MTN : 97, 96, 61, 62, 51, 52, 53, 54
      if (['97', '96', '61', '62', '51', '52', '53', '54'].includes(prefix)) {
        setNetworkId('mtn');
      }
      // Moov : 95, 94, 63, 64, 65, 55
      else if (['95', '94', '63', '64', '65', '55'].includes(prefix)) {
        setNetworkId('moov');
      }
      // Celtis : 40, 41, 42, 43, 98, 99
      else if (['40', '41', '42', '43', '98', '99'].includes(prefix)) {
        setNetworkId('celtis');
      }
    }
  }, [phone]);

  // Validation solde insuffisant
  const isInsufficientNetworkBalance = type === 'withdrawal' && numericAmount > networkBalance;

  // Validation globale
  const normalizedPhone = normalizePhoneNumber(phone);
  const isPhoneValid = normalizedPhone.replace(/[^\d]/g, '').length >= 8;
  const isAmountValid = numericAmount > 0;
  const canSubmit = isAmountValid && isPhoneValid && !isInsufficientNetworkBalance;

  // Raccourcis de montants rapides
  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleQuickAmount = (val: number) => {
    setRawAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      type,
      networkId,
      amount: numericAmount,
      clientPhone: normalizedPhone,
      clientName: name.trim(),
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-10 flex flex-col">
        
        {/* ======================================================== */}
        {/* HEADER TIVO NOUVELLE TRANSACTION */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-5 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              aria-label="Retour au Dashboard"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>En ligne</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Changer de thème"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
            </button>
          </div>

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Nouvelle transaction
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Enregistrez rapidement un dépôt ou un retrait Mobile Money
            </p>
          </div>
        </header>

        {/* ======================================================== */}
        {/* FORMULAIRE PRINCIPAL DE TRANSACTION */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-5 flex flex-col gap-5 flex-1">
          {/* SAISIE INTELLIGENTE : PHOTO OCR & SMS (ACTIVABLE / DÉSACTIVABLE DANS LES PARAMÈTRES) */}
          {settings.enableOcrAndSmsImport !== false && onOpenImport && (
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 border border-blue-500/20 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Saisie Automatique Rapide
                </span>
                <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  OCR & SMS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Option 1 : Photographier l'écran (touches ou smartphone) */}
                <button
                  type="button"
                  onClick={() => onOpenImport('photo')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-blue-50/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2.5 text-left transition-all active:scale-98 group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                      Photo Écran
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Touches ou mobile
                    </span>
                  </div>
                </button>

                {/* Option 2 : Copier-Coller le SMS */}
                <button
                  type="button"
                  onClick={() => onOpenImport('paste')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-emerald-50/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2.5 text-left transition-all active:scale-98 group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                      Coller SMS
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Message copié
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* 1. SÉLECTEUR DE TYPE : ENVOYER OU RETIRER */}
            <div className="grid grid-cols-2 gap-3">
              {/* Option ENVOYER (Dépôt) */}
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all btn-press ${
                  type === 'deposit'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    type === 'deposit'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-extrabold tracking-tight block">ENVOYER</span>
                  <span className="text-[10px] opacity-80">+ Dépôt au client</span>
                </div>
              </button>

              {/* Option RETIRER (Retrait) */}
              <button
                type="button"
                onClick={() => setType('withdrawal')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all btn-press ${
                  type === 'withdrawal'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-md ring-2 ring-rose-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    type === 'withdrawal'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-extrabold tracking-tight block">RETIRER</span>
                  <span className="text-[10px] opacity-80">− Donner des espèces</span>
                </div>
              </button>
            </div>

            {/* 2. SÉLECTION DU RÉSEAU OPERATEUR */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide flex items-center justify-between">
                <span>Opérateur (Réseau)</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  MoMo / Moov / Celtis
                </span>
              </label>

              {/* Puces des réseaux */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {TIVO_NETWORKS.map((net) => {
                  const isSelected = networkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setNetworkId(net.id)}
                      className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-[10.5px] sm:text-xs font-extrabold flex flex-col items-center gap-1 sm:gap-1.5 border transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/25 shadow-xs'
                          : 'bg-white dark:bg-[#0D1525] border-slate-200 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#121E33] shadow-xs'
                      }`}
                    >
                      <div
                        className="flex items-center justify-center w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full"
                        style={{ backgroundColor: `${net.color}25` }}
                      >
                        <span
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: net.color }}
                        />
                      </div>
                      <span className="truncate max-w-full font-bold tracking-tight">{net.code}</span>
                    </button>
                  );
                })}
              </div>

              {/* BANDEAU INDICATEUR DES SOLDES DISPONIBLES */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm mt-1 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: currentNetwork.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Disponible sur ce compte {currentNetwork.name} :
                  </span>
                </div>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm shrink-0">
                  {formatFCFA(networkBalance)}
                </span>
              </div>
            </div>

            {/* 3. MONTANT EN GRAND */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                Combien d'argent ? (Montant)
              </label>

              <div
                className={`relative rounded-3xl p-3.5 sm:p-4 transition-all border ${
                  isInsufficientNetworkBalance
                    ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-slate-400 font-extrabold text-xl sm:text-2xl md:text-3xl shrink-0">
                    {type === 'deposit' ? '+' : '−'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={rawAmount ? parseInt(rawAmount, 10).toLocaleString('fr-FR') : ''}
                    onChange={(e) => setRawAmount(sanitizeAmountInput(e.target.value))}
                    className="w-full text-center text-2xl sm:text-3xl md:text-4xl font-black bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none tracking-tight break-words min-w-0"
                  />
                  <span className="text-xs sm:text-sm md:text-base font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shrink-0">
                    FCFA
                  </span>
                </div>

                {/* ALERTE BLOCAGE SOLDE INSUFFISANT */}
                {isInsufficientNetworkBalance && (
                  <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-bold animate-pulse text-center">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Solde insuffisant ({formatFCFA(networkBalance)} disponible)</span>
                  </div>
                )}
              </div>

              {/* Puces de montants rapides (1-tap rapide) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickAmount(q)}
                    className="px-2.5 py-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition-all shrink-0 active:scale-95"
                  >
                    +{formatFCFA(q, false)}
                  </button>
                ))}
              </div>

              {/* INDICATION EN DIRECT DES FRAIS & GAIN KIOSQUE (PHASE 16) */}
              {numericAmount > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs animate-in fade-in duration-150 gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                      Frais : <strong className="text-slate-900 dark:text-white font-extrabold">{feeEstimate.clientFee === 0 ? 'Gratuit' : formatFCFA(feeEstimate.clientFee)}</strong>
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                    Gain : +{formatFCFA(feeEstimate.agentCommission)}
                  </span>
                </div>
              )}
            </div>

            {/* 4. NUMÉRO DU CLIENT (Avec normalisation Bénin / Afrique de l'Ouest) */}
            <div className="flex flex-col gap-1.5">
              <TivoField
                label="Numéro du client"
                placeholder="Ex: 97 45 12 89 ou +229..."
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-blue-500" />}
                rightElement={
                  isPhoneValid ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" /> Valide
                    </span>
                  ) : undefined
                }
                helperText={`Format normalisé Tivo : ${normalizedPhone || 'Saisissez le numéro'}`}
                required
              />
            </div>

            {/* 5. NOM DU CLIENT (FACULTATIF) */}
            <div className="flex flex-col gap-1.5">
              <TivoField
                label="Nom du client (facultatif)"
                placeholder="Ex: Sèdami KPADONOU"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                helperText="Permet de retrouver plus facilement l'opération dans l'historique"
              />
            </div>

            {/* 6. APERÇU DE L'IMPACT FINANCIER */}
            {numericAmount > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 via-sky-500/5 to-cyan-500/5 border border-blue-500/20 flex flex-col gap-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Impact immédiat après validation :
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 block">Solde {currentNetwork.code} :</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {type === 'deposit'
                        ? `${formatFCFA(networkBalance)} → ${formatFCFA(networkBalance - numericAmount)}`
                        : `${formatFCFA(networkBalance)} → ${formatFCFA(networkBalance + numericAmount)}`}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 block">Espèces en caisse :</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {type === 'deposit'
                        ? `${formatFCFA(cashBalance)} → ${formatFCFA(cashBalance + numericAmount)}`
                        : `${formatFCFA(cashBalance)} → ${formatFCFA(cashBalance - numericAmount)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

              {/* 7. BOUTONS D'ACTION */}
              <div className="flex flex-col gap-2.5 mt-2">
                <TivoButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!canSubmit}
                >
                  {isInsufficientNetworkBalance
                    ? "Pas assez d'argent sur ce compte pour retirer"
                    : 'Valider et Continuer →'}
                </TivoButton>

              <TivoButton
                type="button"
                variant="ghost"
                size="md"
                fullWidth
                onClick={onBack}
              >
                Annuler
              </TivoButton>
            </div>

          </form>
        </main>

      </div>
    </div>
  );
};
