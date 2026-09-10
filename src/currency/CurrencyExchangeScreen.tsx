// ============================================================================
// TIVO CURRENCY EXCHANGE SCREEN — PHASE 19
// Guichet de Change, Convertisseur Multi-Devises & Grille Tarifaire Frontalière
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  TrendingUp, 
  Sparkles, 
  Send, 
  Check, 
  CheckCircle2, 
  Sliders, 
  RotateCcw, 
  Wallet, 
  Info, 
  User, 
  FileText, 
  Clock
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAgency } from '../context/AgencyContext';
import { 
  SUPPORTED_CURRENCIES, 
  formatForeignCurrency, 
  MARKET_PRESETS_DATA 
} from './currencyData';
import { 
  calculateExchange, 
  generateWhatsAppExchangeSlip 
} from './currencyEngine';
import { 
  CurrencyCode, 
  ExchangeOperationType, 
  MarketRatePreset,
  CurrencyExchangeTransaction
} from './currencyTypes';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';

interface CurrencyExchangeScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type SubTab = 'calculator' | 'rates' | 'history';

export const CurrencyExchangeScreen: React.FC<CurrencyExchangeScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  const { 
    exchangeRates, 
    exchangeTransactions, 
    todayExchangesCount, 
    todayExchangeVolumeXof, 
    todayExchangeGainsXof,
    updateCurrencyRate,
    applyMarketPreset,
    resetToDefaultRates,
    executeExchange,
  } = useCurrency();

  const { profile } = useAgency();

  // Navigation interne
  const [activeTab, setActiveTab] = useState<SubTab>('calculator');

  // État du calculateur / guichet
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('NGN');
  const [operationType, setOperationType] = useState<ExchangeOperationType>('buy');
  const [foreignAmountInput, setForeignAmountInput] = useState<string>('50000');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modale de modification de taux
  const [editingCurrency, setEditingCurrency] = useState<CurrencyCode | null>(null);
  const [editBuyRate, setEditBuyRate] = useState<string>('');
  const [editSellRate, setEditSellRate] = useState<string>('');

  // Modale de confirmation de succès
  const [lastExchange, setLastExchange] = useState<CurrencyExchangeTransaction | null>(null);

  // Configuration de la devise active
  const activeCurrConfig = SUPPORTED_CURRENCIES[selectedCurrency];

  // Montant numérique
  const numericForeignAmount = useMemo(() => {
    const val = parseFloat(foreignAmountInput.replace(/\s/g, ''));
    return isNaN(val) || val <= 0 ? 0 : val;
  }, [foreignAmountInput]);

  // Résultat du calcul en temps réel
  const calculation = useMemo(() => {
    return calculateExchange(
      selectedCurrency,
      numericForeignAmount,
      operationType,
      exchangeRates
    );
  }, [selectedCurrency, numericForeignAmount, operationType, exchangeRates]);

  // Raccourcis de montants rapides selon la devise
  const quickChips = useMemo(() => {
    switch (selectedCurrency) {
      case 'NGN':
        return [20000, 50000, 100000, 200000, 500000];
      case 'EUR':
        return [50, 100, 200, 500, 1000];
      case 'USD':
        return [50, 100, 200, 500, 1000];
      case 'GHS':
        return [200, 500, 1000, 2000];
      case 'GNF':
        return [500000, 1000000, 2000000, 5000000];
      case 'XAF':
        return [50000, 100000, 250000, 500000];
      default:
        return [10000, 50000, 100000];
    }
  }, [selectedCurrency]);

  // Validation de l'opération
  const handleConfirmExchange = () => {
    if (numericForeignAmount <= 0) {
      onShowToast?.('warning', 'Montant invalide', 'Veuillez saisir un montant supérieur à zéro.');
      return;
    }

    const res = executeExchange({
      foreignCurrency: selectedCurrency,
      foreignAmount: numericForeignAmount,
      operationType,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (res.success && res.transaction) {
      setLastExchange(res.transaction);
      onShowToast?.(
        'success', 
        'Opération de change validée ! 🎉', 
        `Caisse physique mise à jour : ${operationType === 'buy' ? 'Décaissement' : 'Encaissement'} de ${formatFCFA(res.transaction.xofAmount)}.`
      );
      // Réinitialiser champs secondaires
      setClientName('');
      setClientPhone('');
      setNotes('');
    } else {
      onShowToast?.('error', 'Erreur de change', res.error || 'Impossible d’enregistrer.');
    }
  };

  // Édition d'un taux
  const handleOpenEditRate = (code: CurrencyCode) => {
    const r = exchangeRates[code];
    setEditingCurrency(code);
    setEditBuyRate(r.buyRate.toString());
    setEditSellRate(r.sellRate.toString());
  };

  const handleSaveRate = () => {
    if (!editingCurrency) return;
    const b = parseFloat(editBuyRate);
    const s = parseFloat(editSellRate);

    if (isNaN(b) || isNaN(s) || b <= 0 || s <= 0) {
      onShowToast?.('warning', 'Taux invalides', 'Veuillez saisir des taux numériques positifs.');
      return;
    }

    updateCurrencyRate(editingCurrency, b, s);
    onShowToast?.('success', 'Taux mis à jour', `Nouveaux cours enregistrés pour le ${editingCurrency}.`);
    setEditingCurrency(null);
  };

  // Envoi WhatsApp
  const handleSendWhatsApp = (tx: CurrencyExchangeTransaction) => {
    const url = generateWhatsAppExchangeSlip(tx, profile.agencyName);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER BLEU GÉRANT & STATISTIQUES CHANGE DU JOUR */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-6 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
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

            <span className="px-3 py-1 rounded-full glass-pill text-[11px] font-extrabold text-white flex items-center gap-1.5">
              <span>🌍</span>
              <span>Multi-Devises & Frontière</span>
            </span>
          </div>

          {/* Titre & Gains */}
          <div className="relative z-10 mb-4">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Guichet de Change</span>
              <span className="text-base">💱</span>
            </h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Naira (NGN), Euro (EUR), Dollar (USD), Cedi (GHS) & FCFA
            </p>
          </div>

          {/* Bandeau KPI Change du Jour */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 sm:p-3 text-center">
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-blue-200 font-bold uppercase tracking-wider block truncate">Gains Jour</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono block truncate" title={`+${formatFCFA(todayExchangeGainsXof)}`}>
                +{formatFCFA(todayExchangeGainsXof)}
              </span>
            </div>
            <div className="border-x border-white/10 min-w-0 px-1">
              <span className="text-[9px] sm:text-[10px] text-blue-200 font-bold uppercase tracking-wider block truncate">Volume XOF</span>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono block truncate" title={formatFCFA(todayExchangeVolumeXof)}>
                {formatFCFA(todayExchangeVolumeXof)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-blue-200 font-bold uppercase tracking-wider block truncate">Opérations</span>
              <span className="text-xs sm:text-sm font-black text-white font-mono block truncate">
                {todayExchangesCount}
              </span>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. NAVIGATION PAR ONGLETS */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-300/50 dark:border-slate-800 text-xs gap-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Convertisseur</span>
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'rates'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Taux</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 truncate ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Historique ({exchangeTransactions.length})</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. CONTENU DES ONGLETS */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-2 space-y-4 flex-1">

          {/* ======================================================== */}
          {/* ONGLET 1 : CONVERTISSEUR & GUICHET DE CHANGE */}
          {/* ======================================================== */}
          {activeTab === 'calculator' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* SÉLECTION DE LA DEVISE ÉTRANGÈRE */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wider">
                  1. Sélectionner la devise au comptoir :
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['NGN', 'EUR', 'USD', 'GHS', 'GNF', 'XAF'] as CurrencyCode[]).map((code) => {
                    const cfg = SUPPORTED_CURRENCIES[code];
                    const isSelected = selectedCurrency === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setSelectedCurrency(code)}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">{cfg.flag}</span>
                        <span className="text-xs font-black">{code}</span>
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {cfg.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SENS DU CHANGE (ACHAT VS VENTE) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    2. Sens de l'opération :
                  </span>
                  <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                    {calculation.unitRateDisplay}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOperationType('buy')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      operationType === 'buy'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                        ACHAT AU CLIENT
                      </span>
                      <span className="text-xs">📥</span>
                    </div>
                    <p className="text-[11px] leading-tight">
                      Le client remet des {selectedCurrency} et reçoit des FCFA.
                    </p>
                  </button>

                  <button
                    onClick={() => setOperationType('sell')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      operationType === 'sell'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                        VENTE AU CLIENT
                      </span>
                      <span className="text-xs">📤</span>
                    </div>
                    <p className="text-[11px] leading-tight">
                      Le client paye en FCFA pour obtenir des {selectedCurrency}.
                    </p>
                  </button>
                </div>
              </div>

              {/* SAISIE DU MONTANT EN DEVISES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    3. Montant en devises ({activeCurrConfig.flag} {selectedCurrency}) :
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Unité usuelle : {activeCurrConfig.unitStep.toLocaleString('fr-FR')} {selectedCurrency}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={foreignAmountInput}
                    onChange={(e) => setForeignAmountInput(e.target.value)}
                    placeholder="50 000"
                    className="w-full h-14 pl-4 pr-16 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                    {activeCurrConfig.symbol}
                  </div>
                </div>

                {/* Raccourcis tactiles */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setForeignAmountInput(chip.toString())}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold shrink-0 transition-all cursor-pointer"
                    >
                      +{chip.toLocaleString('fr-FR')}
                    </button>
                  ))}
                </div>
              </div>

              {/* RÉSULTAT DU CHANGE & IMPACT SUR LA CAISSE */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-indigo-900/50 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                    Équivalence comptoir en FCFA
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                    Marge brute : +{formatFCFA(calculation.estimatedGrossMargin)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block font-semibold truncate">
                      {operationType === 'buy' ? 'Espèces FCFA à remettre au client :' : 'Espèces FCFA à encaisser :'}
                    </span>
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate block" title={formatFCFA(calculation.toAmount)}>
                      {formatFCFA(calculation.toAmount)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block">Taux appliqué</span>
                    <span className="text-[11px] sm:text-xs font-bold text-blue-300">
                      {calculation.effectiveRate} FCFA / 1 {selectedCurrency}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between text-indigo-100">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Impact caisse physique</span>
                  </span>
                  <span className="font-extrabold">
                    {operationType === 'buy' ? `- ${formatFCFA(calculation.toAmount)}` : `+ ${formatFCFA(calculation.toAmount)}`}
                  </span>
                </div>
              </div>

              {/* INFORMATIONS CLIENT OPTIONNELLES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Informations du client (Optionnel pour le reçu WhatsApp)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom du client (ex: Alhadji Moussa)"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Téléphone / WhatsApp (+229 97 00 00 00)"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* BOUTON DE VALIDATION */}
              <button
                type="button"
                onClick={handleConfirmExchange}
                className="w-full h-13 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Valider le change au comptoir</span>
              </button>

            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 2 : GRILLE DES TAUX & GESTION DES MARGES */}
          {/* ======================================================== */}
          {activeTab === 'rates' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* PRESETS RAPIDES DE MARCHÉ */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Barèmes & Cotations de Référence
                  </span>
                  <button
                    onClick={resetToDefaultRates}
                    className="text-[11px] text-slate-400 hover:text-blue-500 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['dantokpa', 'krake', 'official'] as MarketRatePreset[]).map((preset) => {
                    const p = MARKET_PRESETS_DATA[preset];
                    return (
                      <button
                        key={preset}
                        onClick={() => {
                          applyMarketPreset(preset);
                          onShowToast?.('success', `Barème appliqué : ${p.name}`);
                        }}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50 dark:bg-slate-800/60 text-center transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {preset === 'dantokpa' ? 'Dantokpa' : preset === 'krake' ? 'Kraké / Sémé' : 'BCEAO'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {preset === 'dantokpa' ? 'Grand Marché' : preset === 'krake' ? 'Frontière' : 'Officiel'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TABLEAU DES DEVISES & SPREADS */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Cours au Guichet & Marges Brutes
                </h3>

                <div className="space-y-2">
                  {(['NGN', 'EUR', 'USD', 'GHS', 'GNF', 'XAF'] as CurrencyCode[]).map((code) => {
                    const cfg = SUPPORTED_CURRENCIES[code];
                    const r = exchangeRates[code];

                    const step = cfg.unitStep;
                    const buyTotal = Math.round(step * r.buyRate);
                    const sellTotal = Math.round(step * r.sellRate);

                    return (
                      <div
                        key={code}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cfg.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {code}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({cfg.name})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                              Unité : {step.toLocaleString('fr-FR')} {code}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[11px]">
                              <span className="text-slate-400 font-semibold">Achat : </span>
                              <strong className="text-emerald-600 dark:text-emerald-400 font-black">{formatFCFA(buyTotal)}</strong>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-400 font-semibold">Vente : </span>
                              <strong className="text-indigo-600 dark:text-indigo-400 font-black">{formatFCFA(sellTotal)}</strong>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenEditRate(code)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-blue-500 transition-colors"
                            title="Modifier ce cours"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note d'information */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Optimisation des marges comptoir</span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-300">
                    Les cours peuvent être modifiés en direct selon les fluctuations du marché informel de Dantokpa ou de la frontière nigériane pour sécuriser votre spread.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ONGLET 3 : HISTORIQUE DES TRANSACTIONS DE CHANGE */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-semibold text-slate-500">
                  {exchangeTransactions.length} opération{exchangeTransactions.length > 1 ? 's' : ''} enregistrée{exchangeTransactions.length > 1 ? 's' : ''}
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  Marge totale : +{formatFCFA(todayExchangeGainsXof)}
                </span>
              </div>

              {exchangeTransactions.length > 0 ? (
                <div className="space-y-2.5">
                  {exchangeTransactions.map((tx) => {
                    const cfg = SUPPORTED_CURRENCIES[tx.foreignCurrency];
                    const isBuy = tx.operationType === 'buy';

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                            <span className="text-2xl shrink-0">{cfg.flag}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shrink-0 ${
                                  isBuy ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                                }`}>
                                  {isBuy ? 'ACHAT' : 'VENTE'}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {formatForeignCurrency(tx.foreignAmount, tx.foreignCurrency)}
                                </span>
                              </div>
                              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">
                                {tx.dateStr} à {tx.timeStr} • {tx.cashierName}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block font-mono">
                              {formatFCFA(tx.xofAmount)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block">
                              Gain : +{formatFCFA(tx.grossMarginXof)}
                            </span>
                          </div>
                        </div>

                        {tx.clientName && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            Client : <strong className="text-slate-700 dark:text-slate-300">{tx.clientName}</strong> {tx.clientPhone && `(${tx.clientPhone})`}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleSendWhatsApp(tx)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Bordereau WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center my-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Aucune opération de change
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Utilisez le convertisseur pour enregistrer votre premier change.
                  </p>
                </div>
              )}

            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* MODALE D'ÉDITION D'UN TAUX DE DEVISE */}
        {/* ======================================================== */}
        {editingCurrency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{SUPPORTED_CURRENCIES[editingCurrency].flag}</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Ajuster le cours : {editingCurrency}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Unité : {SUPPORTED_CURRENCIES[editingCurrency].unitStep.toLocaleString('fr-FR')} {editingCurrency}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCurrency(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Taux d'Achat (FCFA par unité) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editBuyRate}
                    onChange={(e) => setEditBuyRate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Ex: {SUPPORTED_CURRENCIES[editingCurrency].unitStep} {editingCurrency} = {Math.round(SUPPORTED_CURRENCIES[editingCurrency].unitStep * (parseFloat(editBuyRate) || 0))} FCFA
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Taux de Vente (FCFA par unité) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editSellRate}
                    onChange={(e) => setEditSellRate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Ex: {SUPPORTED_CURRENCIES[editingCurrency].unitStep} {editingCurrency} = {Math.round(SUPPORTED_CURRENCIES[editingCurrency].unitStep * (parseFloat(editSellRate) || 0))} FCFA
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCurrency(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveRate}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black shadow-sm hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODALE DE SUCCÈS APRÈS CHANGE VALITÉ */}
        {/* ======================================================== */}
        {lastExchange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-500/30 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Change Enregistré avec Succès !
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  La caisse physique a été impactée de manière synchronisée.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Devise :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatForeignCurrency(lastExchange.foreignAmount, lastExchange.foreignCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Montant FCFA :</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {formatFCFA(lastExchange.xofAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gain net kiosque :</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    +{formatFCFA(lastExchange.grossMarginXof)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(lastExchange)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer le bordereau WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLastExchange(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Fermer
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
