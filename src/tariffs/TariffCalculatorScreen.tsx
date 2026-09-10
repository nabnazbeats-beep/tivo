import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calculator, 
  Table as TableIcon, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Info, 
  Search,
  Plus
} from 'lucide-react';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA, sanitizeAmountInput } from '../design-system/tokens/typography';
import { calculateFees, getTariffBrackets, formatWhatsAppQuote } from './tariffData';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';

interface TariffCalculatorScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: (preset?: { networkId: string; type: 'deposit' | 'withdrawal'; amount: number }) => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const TariffCalculatorScreen: React.FC<TariffCalculatorScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  // Navigation interne : 'calculator' | 'grid'
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'grid'>('calculator');

  // Formulaire simulateur
  const [selectedNetwork, setSelectedNetwork] = useState<string>('mtn');
  const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('withdrawal');
  const [rawAmount, setRawAmount] = useState<string>('50000');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Recherche dans la grille complète
  const [gridSearch, setGridSearch] = useState<string>('');

  // Montant numérique sûr
  const numericAmount = rawAmount ? parseInt(rawAmount, 10) : 0;

  // Calcul dynamique instantané
  const feeResult = useMemo(() => {
    return calculateFees(selectedNetwork, operationType, numericAmount);
  }, [selectedNetwork, operationType, numericAmount]);

  // Grille complète pour l'opérateur et le type sélectionnés
  const fullBrackets = useMemo(() => {
    const brackets = getTariffBrackets(selectedNetwork, operationType);
    if (!gridSearch.trim()) return brackets;

    const query = gridSearch.trim().toLowerCase();
    const queryNum = parseInt(query.replace(/[^\d]/g, ''), 10);

    return brackets.filter((b) => {
      if (!isNaN(queryNum) && queryNum > 0) {
        return (queryNum >= b.min && queryNum <= b.max) || b.label.includes(query);
      }
      return b.label.toLowerCase().includes(query);
    });
  }, [selectedNetwork, operationType, gridSearch]);

  // Configuration du réseau actif
  const currentNetworkConfig: NetworkConfig = 
    TIVO_NETWORKS.find((n) => n.id === selectedNetwork) || TIVO_NETWORKS[0];

  // Raccourcis de montants courants
  const quickAmountIncrements = [5000, 10000, 25000, 50000, 100000, 250000];

  const handleCopyQuote = () => {
    const text = formatWhatsAppQuote(feeResult);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedQuote(true);
      onShowToast?.('success', 'Devis copié !', 'Le texte est prêt à être collé dans vos messages.');
      setTimeout(() => setCopiedQuote(false), 2500);
    }).catch(() => {
      onShowToast?.('error', 'Erreur de copie', 'Veuillez autoriser l’accès au presse-papier.');
    });
  };

  const handleShareWhatsApp = () => {
    const text = formatWhatsAppQuote(feeResult);
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet ou application mobile
    window.open(whatsappUrl, '_blank');
    onShowToast?.('info', 'Ouverture de WhatsApp...', 'Envoi du devis tarifaire au client.');
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER DU CALCULATEUR */}
        {/* ======================================================== */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-6 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Barre du haut avec bouton retour */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              aria-label="Retour"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Grilles UEMOA 2026</span>
            </div>
          </div>

          <div className="relative z-10 text-center mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-100/90 block mb-1">
              Bénin & Espace UEMOA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tarifs & Commissions
            </h1>
            <p className="text-xs text-blue-100 mt-1 max-w-sm mx-auto">
              Simulateur instantané des frais clients et gains nets perçus par votre kiosque.
            </p>
          </div>

          {/* Sélecteur d'onglets interne (Simulateur / Grille) */}
          <div className="relative z-10 flex p-1 bg-black/20 backdrop-blur-md rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveSubTab('calculator')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'calculator'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulateur Rapide</span>
            </button>
            <button
              onClick={() => setActiveSubTab('grid')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Grille Complète</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CORPS PRINCIPAL */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">
          
          {/* SÉLECTEUR D'OPÉRATEUR (MTN, MOOV, CELTIS, SMT) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Opérateur Réseau
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {TIVO_NETWORKS.map((net) => {
                const isSelected = selectedNetwork === net.id;
                return (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net.id)}
                    className={`flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all active:scale-95 min-w-0 ${
                      isSelected
                        ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm mb-1 sm:mb-1.5 shrink-0"
                      style={{ backgroundColor: net.color, color: net.id === 'mtn' ? '#713F12' : '#FFFFFF' }}
                    >
                      {net.code}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {net.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SÉLECTEUR TYPE D'OPÉRATION (DÉPÔT / RETRAIT) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setOperationType('deposit')}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                operationType === 'deposit'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Dépôt (Cash In)</span>
            </button>
            <button
              onClick={() => setOperationType('withdrawal')}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                operationType === 'withdrawal'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Retrait (Cash Out)</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* MODE 1 : SIMULATEUR RAPIDE */}
          {/* ======================================================== */}
          {activeSubTab === 'calculator' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* CHAMP MONTANT & RACCOURCIS */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Montant de l'opération
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Max 2 000 000 FCFA
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rawAmount}
                    onChange={(e) => setRawAmount(sanitizeAmountInput(e.target.value))}
                    placeholder="0"
                    className="w-full h-14 pl-4 pr-16 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    FCFA
                  </span>
                </div>

                {/* Boutons d'incrément rapide */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {quickAmountIncrements.map((inc) => (
                    <button
                      key={inc}
                      onClick={() => setRawAmount(inc.toString())}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        numericAmount === inc
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {formatFCFA(inc, false)}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARTE HAUTE DÉFINITION DES RÉSULTATS */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
                {/* Accent de couleur du réseau en arrière-plan */}
                <div 
                  className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ backgroundColor: currentNetworkConfig.color }}
                />

                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
                      style={{ backgroundColor: currentNetworkConfig.color, color: currentNetworkConfig.id === 'mtn' ? '#713F12' : '#FFFFFF' }}
                    >
                      {currentNetworkConfig.code}
                    </div>
                    <span className="text-xs font-bold text-white">
                      {feeResult.networkName}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Tranche : {feeResult.bracket.label}
                  </span>
                </div>

                {/* Grille 2 colonnes : Frais Client VS Commission Kiosque */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                  {/* Frais Client */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
                      Frais Client
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-black text-white block truncate" title={feeResult.clientFee === 0 ? 'GRATUIT' : formatFCFA(feeResult.clientFee)}>
                      {feeResult.clientFee === 0 ? 'GRATUIT' : formatFCFA(feeResult.clientFee)}
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 block mt-1 truncate">
                      {feeResult.clientFee === 0 ? 'Offert par l’opérateur' : 'Payé par le client'}
                    </span>
                  </div>

                  {/* Commission Kiosque */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 relative min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-1 min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider truncate">
                        Gain Kiosque
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 whitespace-nowrap">
                        {feeResult.agentSharePercent}% marge
                      </span>
                    </div>
                    <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400 block truncate" title={`+ ${formatFCFA(feeResult.agentCommission)}`}>
                      + {formatFCFA(feeResult.agentCommission)}
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-emerald-300/80 block mt-1 truncate">
                      Net perçu par l'agent 💰
                    </span>
                  </div>
                </div>

                {/* Détails du flux au comptoir */}
                <div className="space-y-2 bg-white/5 rounded-2xl p-3 text-xs border border-white/5 mb-5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Montant demandé :</span>
                    <span className="font-bold text-white">{formatFCFA(feeResult.amount)}</span>
                  </div>

                  {operationType === 'deposit' ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Espèces à encaisser au guichet :</span>
                      <span className="font-extrabold text-emerald-400">
                        {formatFCFA(feeResult.cashCollectedFromClient)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Total débité du compte client :</span>
                        <span className="font-extrabold text-amber-300">
                          {formatFCFA(feeResult.totalDebitedFromClient)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Espèces à remettre au client :</span>
                        <span className="font-extrabold text-emerald-400">
                          {formatFCFA(feeResult.cashGivenToClient)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Boutons d'actions rapides (WhatsApp, Copier, Créer transaction) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Devis WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyQuote}
                    className="h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all font-extrabold text-xs text-white flex items-center justify-center gap-2 border border-white/10"
                  >
                    {copiedQuote ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier devis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Raccourci vers la création de transaction avec ce montant pré-rempli */}
                <button
                  onClick={() => onNewTransaction({
                    networkId: selectedNetwork,
                    type: operationType,
                    amount: numericAmount,
                  })}
                  className="w-full mt-3 h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Enregistrer cette opération maintenant</span>
                </button>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2 : GRILLE COMPLÈTE */}
          {/* ======================================================== */}
          {activeSubTab === 'grid' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              
              {/* BARRE DE RECHERCHE DANS LA GRILLE */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={gridSearch}
                  onChange={(e) => setGridSearch(e.target.value)}
                  placeholder="Rechercher par montant (ex: 25000)..."
                  className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* LISTE DES TRANCHES OFFICIELLES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                
                {/* En-tête de la table */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="col-span-5">Tranche (FCFA)</div>
                  <div className="col-span-3 text-right">Frais Client</div>
                  <div className="col-span-4 text-right">Gain Agent</div>
                </div>

                {/* Lignes de tranches */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {fullBrackets.map((bracket) => {
                    const isCurrentAmountInBracket = 
                      numericAmount >= bracket.min && numericAmount <= bracket.max;

                    return (
                      <div
                        key={bracket.id}
                        onClick={() => {
                          setRawAmount(bracket.min.toString());
                          setActiveSubTab('calculator');
                        }}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs items-center cursor-pointer transition-colors ${
                          isCurrentAmountInBracket
                            ? 'bg-blue-50 dark:bg-blue-950/40 font-bold border-l-4 border-blue-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Tranche */}
                        <div className="col-span-5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {bracket.label}
                          </span>
                          {isCurrentAmountInBracket && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              ● Montant simulé
                            </span>
                          )}
                        </div>

                        {/* Frais Client */}
                        <div className="col-span-3 text-right">
                          <span className={`font-black ${
                            bracket.clientFee === 0 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {bracket.clientFee === 0 ? 'Gratuit' : formatFCFA(bracket.clientFee, false)}
                          </span>
                        </div>

                        {/* Gain Agent */}
                        <div className="col-span-4 text-right">
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                            +{formatFCFA(bracket.agentCommission, false)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {bracket.clientFee > 0 
                              ? `${Math.round((bracket.agentCommission / bracket.clientFee) * 100)}% marge`
                              : '100% net'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note informative sur la réglementation BCEAO */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/70 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Conformité réglementaire BCEAO / UEMOA</span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-300">
                    Les grilles tarifaires ci-dessus respectent les barèmes officiels des distributeurs agréés au Bénin. Les commissions gérants sont automatiquement intégrées dans vos journaux comptables Tivo.
                  </span>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* 3. NAVIGATION BASSE MOBILE */}
        {/* ======================================================== */}
        <TivoBottomNav
          activeTab="accounting"
          onTabChange={onNavigateTab}
          onAddClick={() => onNewTransaction()}
        />

      </div>
    </div>
  );
};
