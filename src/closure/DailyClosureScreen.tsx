import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Printer, 
  Share2, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions, DailyClosure } from '../context/TransactionContext';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoCard } from '../design-system/components/TivoCard';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';

interface DailyClosureScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onOpenCashCalculator?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const DailyClosureScreen: React.FC<DailyClosureScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onOpenCashCalculator,
  onShowToast,
}) => {
  const { user } = useAuth();
  const { 
    todaySummary, 
    transactions, 
    networkBalances, 
    totalMobileMoneyBalance, 
    cashBalance, 
    cashAudits, 
    closures, 
    isTodayClosed, 
    closeDay, 
    reopenDay 
  } = useTransactions();

  const [closureNotes, setClosureNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState<DailyClosure | null>(() => {
    // Si aujourd'hui est clôturé, sélectionner la clôture d'aujourd'hui
    return closures.find((c) => c.dateStr === "Aujourd'hui") || (closures.length > 0 ? closures[0] : null);
  });

  // Dernier décompte de caisse effectué
  const latestCashAudit = cashAudits.length > 0 ? cashAudits[0] : null;

  // Calcul du volume par réseau pour aujourd'hui
  const networkBreakdown = React.useMemo(() => {
    return TIVO_NETWORKS.map((net: NetworkConfig) => {
      let deposits = 0;
      let withdrawals = 0;
      let count = 0;

      transactions.forEach((tx) => {
        if (tx.networkId === net.id) {
          if (tx.type === 'deposit') deposits += tx.amount;
          else withdrawals += tx.amount;
          count++;
        }
      });

      return {
        ...net,
        deposits,
        withdrawals,
        count,
        total: deposits + withdrawals,
        currentBalance: networkBalances[net.id] || 0,
      };
    });
  }, [transactions, networkBalances]);

  // Validation de la clôture
  const handleExecuteClosure = () => {
    const res = closeDay(closureNotes, user?.name);
    setShowConfirmModal(false);

    if (res.success) {
      onShowToast?.(
        'success',
        'Journée fermée à clé !',
        'Toutes les opérations ont été rangées et sécurisées 🔒.'
      );
    }
  };

  // Réouverture de la journée (Mode démo)
  const handleReopen = () => {
    reopenDay();
    setSelectedClosure(null);
    onShowToast?.(
      'info',
      'Journée réouverte',
      'Les opérations du jour peuvent de nouveau être modifiées.'
    );
  };

  // Clôture active à afficher (celle d'aujourd'hui si clôturé, ou celle sélectionnée)
  const todayClosure = closures.find((c) => c.dateStr === "Aujourd'hui");
  const activeClosure = todayClosure || selectedClosure;

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        <TivoHeader
          title="Fermer la journée (Bilan)"
          subtitle="Faire le point du soir et fermer la caisse"
          showBack
          onBack={onBack}
          rightAction={
            isTodayClosed ? (
              <button
                onClick={handleReopen}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-colors"
                title="Déverrouiller pour ajustement (Mode Démo)"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Débloquer</span>
              </button>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>En cours</span>
              </div>
            )
          }
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-5">
          
          {/* ======================================================== */}
          {/* CAS A : LA JOURNÉE EST DÉJÀ CLÔTURÉE */}
          {/* ======================================================== */}
          {isTodayClosed && activeClosure ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Sceau officiel de clôture */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-tivo-md relative overflow-hidden border border-slate-700">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                        Journée fermée à clé 🔒
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activeClosure.closedAtTime}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white mt-0.5">
                      Journée du {activeClosure.dateStr}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Fermé par {activeClosure.closedBy}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/80 text-xs text-slate-300">
                  <p>
                    🔒 Toutes les opérations de cette journée sont rangées et protégées sous cadenas. Personne ne peut les modifier.
                  </p>
                </div>
              </div>

              {/* TICKET DE CLÔTURE FORMAT REÇU FINTECH */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* En-tête ticket */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo-tivo.png" alt="Tivo" className="w-6 h-6 rounded-lg object-contain" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Reçu de fermeture de journée
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                    {activeClosure.id.toUpperCase()}
                  </span>
                </div>

                {/* Corps ticket */}
                <div className="p-5 flex flex-col gap-4 text-xs font-mono">
                  
                  {/* Flux clients */}
                  <div>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      1. Argent des clients (Envois & Retraits)
                    </span>
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Envoyé ({activeClosure.depositCount} ops) :</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatFCFA(activeClosure.totalDeposits)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Donné ({activeClosure.withdrawalCount} ops) :</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          −{formatFCFA(activeClosure.totalWithdrawals)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                        <span>Ce qui reste (Envois − Retraits) :</span>
                        <span className={activeClosure.netVariation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {activeClosure.netVariation >= 0 ? '+' : ''}{formatFCFA(activeClosure.netVariation)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrêt des comptes */}
                  <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      2. Argent total dans votre boutique
                    </span>
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Dans les téléphones (MoMo/Moov/Celtis) :</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatFCFA(activeClosure.totalMobileMoney)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Argent liquide dans le tiroir :</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatFCFA(activeClosure.cashBalance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Différence de caisse :</span>
                        <span className={`font-bold ${activeClosure.cashDiscrepancy === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {activeClosure.cashDiscrepancy === 0 ? '0 FCFA (Caisse exacte)' : `${activeClosure.cashDiscrepancy > 0 ? '+' : ''}${formatFCFA(activeClosure.cashDiscrepancy)}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white font-sans">
                        <span>Total de tout votre argent :</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">
                          {formatFCFA(activeClosure.totalTreasury)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Observation */}
                  {activeClosure.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-sans text-slate-600 dark:text-slate-300">
                      <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider">
                        Remarque du gérant :
                      </span>
                      {activeClosure.notes}
                    </div>
                  )}

                  {/* Tampon de conformité */}
                  <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800">
                    CERTIFIÉ PAR TIVO MOBILE MONEY • SÉCURITÉ CONFORME UEMOA
                  </div>
                </div>

                {/* Boutons d'export et impression */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimer</span>
                  </button>

                  <button
                    onClick={() => {
                      onShowToast?.('success', 'Rapport partagé', 'Lien du rapport de clôture copié dans le presse-papiers.');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Envoyer par WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ======================================================== */
            /* CAS B : LA JOURNÉE N'EST PAS ENCORE CLÔTURÉE */
            /* ======================================================== */
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Carte Hero Assistant de clôture */}
              <div className="relative bg-gradient-to-br from-blue-600 to-sky-600 rounded-3xl p-5 text-white shadow-tivo-md overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-200" />
                    Fin de journée (Bilan du soir)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                    {transactions.length} opérations
                  </span>
                </div>

                <div className="mt-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Prêt à fermer la journée ?
                  </h2>
                  <p className="text-xs text-blue-100/90 mt-1">
                    Vérifiez l'argent, comptez vos billets et pièces, puis fermez la caisse à clé.
                  </p>
                </div>

                {/* Synthèse 3 chiffres */}
                <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/10 rounded-xl p-2">
                    <span className="text-[10px] text-blue-100 block">Envoyé</span>
                    <span className="font-bold text-sm text-white font-mono mt-0.5 block">
                      +{formatFCFA(todaySummary.totalDeposits)}
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2">
                    <span className="text-[10px] text-blue-100 block">Retiré</span>
                    <span className="font-bold text-sm text-white font-mono mt-0.5 block">
                      −{formatFCFA(todaySummary.totalWithdrawals)}
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2">
                    <span className="text-[10px] text-blue-100 block">Reste</span>
                    <span className="font-bold text-sm text-white font-mono mt-0.5 block">
                      {todaySummary.netVariation >= 0 ? '+' : ''}{formatFCFA(todaySummary.netVariation)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ÉTAPE 1 : CONTRÔLE DE LA CAISSE PHYSIQUE */}
              <TivoCard variant="default" className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        1. Compter les billets et pièces
                      </h3>
                      <span className="text-xs text-slate-500">
                        Vérifier l'argent liquide dans votre tiroir
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                    {formatFCFA(cashBalance)}
                  </span>
                </div>

                {/* Statut du décompte physique */}
                {latestCashAudit ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        Comptage fait à {latestCashAudit.timeStr} ({formatFCFA(latestCashAudit.physicalBalance)})
                      </span>
                    </div>
                    <span className="font-bold text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      {latestCashAudit.discrepancy === 0 ? 'Conforme' : 'Ajusté'}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Vous n'avez pas encore compté vos billets et pièces aujourd'hui.</span>
                    </div>
                    {onOpenCashCalculator && (
                      <button
                        onClick={onOpenCashCalculator}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                      >
                        <Scale className="w-3 h-3" />
                        <span>Compter</span>
                      </button>
                    )}
                  </div>
                )}
              </TivoCard>

              {/* ÉTAPE 2 : CONTRÔLE DES SOLDES RÉSEAUX */}
              <TivoCard variant="default" className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        2. Argent dans les téléphones
                      </h3>
                      <span className="text-xs text-slate-500">
                        {TIVO_NETWORKS.length} comptes de téléphones vérifiés
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-sm text-blue-600 dark:text-blue-400 font-mono">
                    {formatFCFA(totalMobileMoneyBalance)}
                  </span>
                </div>

                {/* Mini tableau des soldes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {networkBreakdown.slice(0, 4).map((net) => (
                    <div key={net.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{net.name}</span>
                      </div>
                      <span className="font-black text-xs text-slate-900 dark:text-white font-mono mt-1 block">
                        {formatFCFA(net.currentBalance)}
                      </span>
                    </div>
                  ))}
                </div>
              </TivoCard>

              {/* ÉTAPE 3 : NOTE DU GÉRANT ET BOUTON DE CLÔTURE */}
              <TivoCard variant="default" className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      3. Une remarque sur la journée ? (Optionnel)
                    </h3>
                    <span className="text-xs text-slate-500">
                      Écrivez ici si vous avez une information à garder
                    </span>
                  </div>
                </div>

                <textarea
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Ex: Journée calme, pas de coupure de réseau, caisse exacte..."
                  rows={2}
                  className="w-full text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="pt-2">
                  <TivoButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<Lock className="w-5 h-5" />}
                    onClick={() => setShowConfirmModal(true)}
                    className="btn-press shadow-tivo-md"
                  >
                    Fermer la journée à clé 🔒 ({transactions.length} opérations)
                  </TivoButton>
                </div>
              </TivoCard>

            </div>
          )}

          {/* ======================================================== */}
          {/* HISTORIQUE DES ANCIENNES CLÔTURES */}
          {/* ======================================================== */}
          {closures.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Anciennes journées fermées ({closures.length})
              </span>

              {closures.map((c) => (
                <TivoCard
                  key={c.id}
                  variant="default"
                  onClick={() => setSelectedClosure(c)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    selectedClosure?.id === c.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                      <Lock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.dateStr}
                        </span>
                        <span className="text-[10px] text-slate-400">à {c.closedAtTime}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {c.transactionCount} opérations • {c.closedBy}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                      {formatFCFA(c.totalTreasury)}
                    </span>
                    <span className="text-[10px] text-slate-400">Total argent</span>
                  </div>
                </TivoCard>
              ))}
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* MODAL DE CONFIRMATION DU VEROUILLAGE */}
        {/* ======================================================== */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Fermer la journée maintenant ?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cette action ferme la journée et met toutes les opérations sous cadenas 🔒
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <span className="font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Ce qui va se passer :
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Les {transactions.length} opérations du jour seront protégées sous cadenas 🔒.</li>
                  <li>Les totaux de vos téléphones et de votre caisse seront bien enregistrés.</li>
                  <li>Vous pourrez imprimer ou envoyer le reçu par WhatsApp.</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Annuler
                </button>
                <TivoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex-1"
                  onClick={handleExecuteClosure}
                >
                  Oui, fermer à clé 🔒
                </TivoButton>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BOTTOM NAVIGATION */}
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
