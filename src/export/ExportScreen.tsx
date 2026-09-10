import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Share2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  Table, 
  Receipt, 
  Calendar,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoCard } from '../design-system/components/TivoCard';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { TIVO_NETWORKS } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { exportElementAsImage, exportElementAsPDF, printElementOnly } from '../utils/exportDocument';

interface ExportScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type ExportFormat = 'whatsapp' | 'csv' | 'pdf' | 'receipt';
type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export const ExportScreen: React.FC<ExportScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onShowToast,
}) => {
  const { user } = useAuth();
  const { 
    transactions, 
    networkBalances, 
    totalMobileMoneyBalance, 
    cashBalance, 
    isTodayClosed 
  } = useTransactions();

  const [activeFormat, setActiveFormat] = useState<ExportFormat>('whatsapp');
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [copied, setCopied] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');

  // Filtrage des transactions selon la période choisie
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    return transactions.filter((tx) => {
      if (period === 'all') return true;
      if (period === 'today') return tx.dateStr === "Aujourd'hui";

      const txDate = new Date(tx.timestamp).getTime();
      const diffDays = (now - txDate) / oneDay;

      if (period === 'week') return diffDays <= 7;
      if (period === 'month') return diffDays <= 30;
      return true;
    });
  }, [transactions, period]);

  // Agrégats sur les transactions filtrées
  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'deposit') {
        totalDeposits += tx.amount;
        depositCount++;
      } else {
        totalWithdrawals += tx.amount;
        withdrawalCount++;
      }
    });

    return {
      totalDeposits,
      totalWithdrawals,
      depositCount,
      withdrawalCount,
      totalCount: filteredTransactions.length,
      netVariation: totalDeposits - totalWithdrawals,
      totalVolume: totalDeposits + totalWithdrawals,
    };
  }, [filteredTransactions]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'today': return "Aujourd'hui";
      case 'week': return '7 derniers jours (Semaine)';
      case 'month': return 'Ce mois-ci (30 jours)';
      case 'all': return 'Historique complet';
    }
  }, [period]);

  // ========================================================
  // 1. GÉNÉRATION DU MESSAGE WHATSAPP FORMATÉ
  // ========================================================
  const whatsappMessage = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    let msg = `📱 *TIVO MOBILE MONEY — RAPPORT DU POINT*\n`;
    msg += `📅 *Date :* ${todayStr} (${periodLabel})\n`;
    msg += `👤 *Gérant :* ${user?.name || 'Nazirou GBADAMASSI'}\n`;
    msg += `🔒 *Statut :* ${isTodayClosed ? 'Journée clôturée avec cadenas 🔒' : 'Opérations en cours 🟢'}\n\n`;

    msg += `📊 *RÉCAPITULATIF DES FLUX CLIENTS*\n`;
    msg += `• *Dépôts :* +${formatFCFA(stats.totalDeposits)} (${stats.depositCount} ops)\n`;
    msg += `• *Retraits :* −${formatFCFA(stats.totalWithdrawals)} (${stats.withdrawalCount} ops)\n`;
    msg += `• *Variation Nette :* ${stats.netVariation >= 0 ? '+' : ''}${formatFCFA(stats.netVariation)}\n`;
    msg += `• *Total Opérations :* ${stats.totalCount}\n\n`;

    msg += `📶 *SOLDES FLOTTE RÉSEAUX*\n`;
    TIVO_NETWORKS.forEach((net) => {
      const bal = networkBalances[net.id] || 0;
      msg += `• ${net.name} : ${formatFCFA(bal)}\n`;
    });
    msg += `👉 *Total Flotte Mobile Money :* ${formatFCFA(totalMobileMoneyBalance)}\n\n`;

    msg += `💵 *TIROIR-CAISSE (ESPÈCES)*\n`;
    msg += `• Espèces disponibles : ${formatFCFA(cashBalance)}\n\n`;

    msg += `🏛️ *TRÉSORERIE TOTALE DU POINT*\n`;
    msg += `💰 *Actif Net Consolidé :* ${formatFCFA(totalMobileMoneyBalance + cashBalance)}\n\n`;

    msg += `_Rapport certifié et généré automatiquement par l'application Tivo._`;
    return msg;
  }, [user, isTodayClosed, stats, periodLabel, networkBalances, totalMobileMoneyBalance, cashBalance]);

  // Copier le message WhatsApp dans le presse-papier
  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    onShowToast?.('success', 'Rapport WhatsApp copié !', 'Collez-le directement dans votre discussion WhatsApp.');
    setTimeout(() => setCopied(false), 2500);
  };

  // Envoyer directement via l'application WhatsApp
  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const cleanPhone = recipientPhone.replace(/\D/g, '');
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
  };

  // ========================================================
  // 2. EXPORT CSV POUR EXCEL
  // ========================================================
  const handleDownloadCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Heure',
      'Type',
      'Réseau',
      'Montant (FCFA)',
      'Téléphone Client',
      'Nom Client',
      'Statut',
      'Source',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.dateStr,
      tx.timeStr,
      tx.type === 'deposit' ? 'Dépôt' : 'Retrait',
      tx.networkId.toUpperCase(),
      tx.amount,
      `"${tx.clientPhone}"`,
      `"${tx.clientName || 'Client Comptoir'}"`,
      tx.isLocked ? 'Clôturé' : 'En cours',
      tx.source.toUpperCase(),
    ]);

    // Encodage avec BOM UTF-8 pour Excel
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tivo_export_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.(
      'success',
      'Fichier CSV téléchargé !',
      `${filteredTransactions.length} transactions prêtes pour analyse dans Excel.`
    );
  };

  // ========================================================
  // 3. EXPORTS DOCUMENT SEUL (PDF, JPEG & IMPRESSION ISOLÉE)
  // ========================================================
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async (elementId: string, baseName: string, isTicket = false) => {
    setIsExporting(true);
    onShowToast?.('info', 'Génération PDF en cours...', 'Exportation du document sans l’interface.');
    try {
      const filename = `${baseName}_${period}_${new Date().toISOString().slice(0, 10)}`;
      const success = await exportElementAsPDF(elementId, filename, isTicket);
      if (success) {
        onShowToast?.('success', 'PDF téléchargé !', 'Le document a été généré proprement en haute définition.');
      } else {
        onShowToast?.('error', 'Erreur export', 'Impossible de générer le fichier PDF.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJPEG = async (elementId: string, baseName: string) => {
    setIsExporting(true);
    onShowToast?.('info', 'Génération image en cours...', 'Capture haute résolution JPEG du document.');
    try {
      const filename = `${baseName}_${period}_${new Date().toISOString().slice(0, 10)}`;
      const success = await exportElementAsImage(elementId, filename, 'jpeg');
      if (success) {
        onShowToast?.('success', 'Image JPEG téléchargée !', 'L’image du document est enregistrée sur votre appareil.');
      } else {
        onShowToast?.('error', 'Erreur export', 'Impossible de capturer l’image.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintIsolated = (elementId: string, isTicket = false) => {
    printElementOnly(elementId, isTicket);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* ======================================================== */}
        {/* 1. HEADER */}
        {/* ======================================================== */}
        <TivoHeader
          title="Export & Partage"
          subtitle="WhatsApp, Excel CSV, PDF & Ticket"
          showBack
          onBack={onBack}
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4">
          
          {/* ======================================================== */}
          {/* 2. SÉLECTEUR DE PÉRIODE */}
          {/* ======================================================== */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Période des données
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
              {filteredTransactions.length} opérations
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
            {[
              { id: 'today' as PeriodFilter, label: 'Aujourd’hui' },
              { id: 'week' as PeriodFilter, label: 'Semaine' },
              { id: 'month' as PeriodFilter, label: 'Mois' },
              { id: 'all' as PeriodFilter, label: 'Tout' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`py-1.5 sm:py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all truncate ${
                  period === p.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* ======================================================== */}
          {/* 3. TABS SEGMENTÉS DES FORMATS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveFormat('whatsapp')}
              className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-0 ${
                activeFormat === 'whatsapp'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              <span className="text-[9.5px] sm:text-[10px] font-bold truncate">WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveFormat('csv')}
              className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-0 ${
                activeFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Table className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              <span className="text-[9.5px] sm:text-[10px] font-bold truncate">Excel CSV</span>
            </button>

            <button
              onClick={() => setActiveFormat('pdf')}
              className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-0 ${
                activeFormat === 'pdf'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
              <span className="text-[9.5px] sm:text-[10px] font-bold truncate">PDF / A4</span>
            </button>

            <button
              onClick={() => setActiveFormat('receipt')}
              className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all min-w-0 ${
                activeFormat === 'receipt'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
              <span className="text-[9.5px] sm:text-[10px] font-bold truncate">Ticket</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 4. CONTENU : FORMAT 1 — WHATSAPP DIRECT */}
          {/* ======================================================== */}
          {activeFormat === 'whatsapp' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <Share2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  Générez un récapitulatif clair et prêt à envoyer au <strong>propriétaire du point</strong> ou au comptable via WhatsApp en un seul clic.
                </p>
              </div>

              {/* Champ optionnel : Numéro WhatsApp du destinataire */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Numéro WhatsApp du destinataire (optionnel) :
                </label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Ex: +229 97 00 11 22"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Aperçu bulle style WhatsApp */}
              <div className="bg-[#EFEAE2] dark:bg-[#0B141A] rounded-3xl p-4 border border-slate-300 dark:border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Aperçu message WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Prêt à envoyer
                  </span>
                </div>

                <div className="bg-white dark:bg-[#1F2C34] rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700 text-xs font-mono whitespace-pre-line text-slate-800 dark:text-slate-100 leading-relaxed max-h-72 overflow-y-auto">
                  {whatsappMessage}
                </div>
              </div>

              {/* Boutons d'action WhatsApp */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyWhatsApp}
                  className="flex-1 py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
                </button>

                <TivoButton
                  variant="primary"
                  size="lg"
                  className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 shadow-tivo-md"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSendWhatsApp}
                >
                  Ouvrir WhatsApp
                </TivoButton>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. CONTENU : FORMAT 2 — CSV POUR EXCEL */}
          {/* ======================================================== */}
          {activeFormat === 'csv' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Table className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  Exportez l'intégralité des écritures au format CSV standard avec encodage <strong>UTF-8 BOM</strong> pour une ouverture parfaite sans bug d'accents dans Microsoft Excel ou Google Sheets.
                </p>
              </div>

              {/* Aperçu des colonnes */}
              <TivoCard variant="default" className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Structure du tableau exporté ({filteredTransactions.length} lignes)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">10 colonnes</span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-1.5">
                  {['ID', 'Date', 'Heure', 'Type', 'Réseau', 'Montant', 'Téléphone', 'Client', 'Statut', 'Source'].map((col) => (
                    <span key={col} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold">
                      {col}
                    </span>
                  ))}
                </div>

                {/* Extrait premières lignes */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-[10px] font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="p-2">Heure</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Réseau</th>
                        <th className="p-2">Montant</th>
                        <th className="p-2">Client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {filteredTransactions.slice(0, 3).map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-2">{tx.timeStr}</td>
                          <td className="p-2 font-bold">{tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}</td>
                          <td className="p-2">{tx.networkId.toUpperCase()}</td>
                          <td className="p-2 font-bold">{formatFCFA(tx.amount)}</td>
                          <td className="p-2 truncate max-w-[100px]">{tx.clientName || tx.clientPhone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TivoCard>

              <TivoButton
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Download className="w-5 h-5" />}
                onClick={handleDownloadCSV}
                className="btn-press shadow-tivo-md"
              >
                Télécharger le fichier CSV ({filteredTransactions.length} transactions)
              </TivoButton>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. CONTENU : FORMAT 3 — PDF / A4 COMPTABLE */}
          {/* ======================================================== */}
          {activeFormat === 'pdf' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>
                  Feuille de situation comptable officielle au format A4. Prête à être imprimée ou sauvegardée en PDF pour l'archivage légal du point de vente.
                </p>
              </div>

              {/* Aperçu de la feuille A4 (Document seul exportable) */}
              <div
                id="tivo-export-a4"
                className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4 text-xs font-sans"
              >
                {/* En-tête document */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo-tivo.png" alt="Tivo" className="w-10 h-10 rounded-xl object-contain shadow-sm" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Tivo Mobile Money
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        État Financier & Comptable • Zone UEMOA
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block">Période</span>
                    <span className="font-bold text-slate-900">{periodLabel}</span>
                  </div>
                </div>

                {/* Synthèse en 3 boîtes */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Dépôts</span>
                    <span className="font-bold text-xs text-emerald-600 font-mono mt-0.5 block">
                      +{formatFCFA(stats.totalDeposits)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Retraits</span>
                    <span className="font-bold text-xs text-rose-600 font-mono mt-0.5 block">
                      −{formatFCFA(stats.totalWithdrawals)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Actif Net Total</span>
                    <span className="font-bold text-xs text-blue-600 font-mono mt-0.5 block">
                      {formatFCFA(totalMobileMoneyBalance + cashBalance)}
                    </span>
                  </div>
                </div>

                {/* Tableau récapitulatif par réseau */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="p-2">Réseau Opérateur</th>
                        <th className="p-2 text-right">Solde Flotte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {TIVO_NETWORKS.map((net) => (
                        <tr key={net.id}>
                          <td className="p-2 flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                            <span>{net.name}</span>
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {formatFCFA(networkBalances[net.id] || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature gérant */}
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-100">
                  <span>Signataire : <strong>{user?.name || 'Gérant de service'}</strong></span>
                  <span>Certifié conforme</span>
                </div>
              </div>

              {/* Boutons d'export Document Seul (PDF, Image JPEG & Impression isolée) */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportPDF('tivo-export-a4', 'tivo_rapport_a4', false)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Télécharger PDF</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportJPEG('tivo-export-a4', 'tivo_rapport_a4')}
                    className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-purple-600" />}
                    <span>Télécharger Image (JPEG)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintIsolated('tivo-export-a4', false)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800/60 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer la feuille A4 (Document seul)</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. CONTENU : FORMAT 4 — TICKET THERMIQUE */}
          {/* ======================================================== */}
          {activeFormat === 'receipt' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Receipt className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  Format ticket de caisse compact (58mm / 80mm) optimisé pour imprimantes thermiques Bluetooth / POS de comptoir.
                </p>
              </div>

              {/* Ticket thermique visuel (Document seul exportable) */}
              <div className="flex justify-center">
                <div
                  id="tivo-export-ticket"
                  className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 text-xs font-mono space-y-3"
                >
                  <div className="text-center pb-2 border-b border-dashed border-slate-300">
                    <img src="/logo-tivo.png" alt="Tivo" className="w-8 h-8 mx-auto rounded-lg mb-1 object-contain" />
                    <span className="font-black text-sm block">TIVO POINT DE SERVICE</span>
                    <span className="text-[10px] text-slate-500">REÇU COMPTABLE JOURNALIER</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date().toLocaleString('fr-FR')}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>DÉPÔTS ({stats.depositCount}) :</span>
                      <span className="font-bold">+{formatFCFA(stats.totalDeposits)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RETRAITS ({stats.withdrawalCount}) :</span>
                      <span className="font-bold">−{formatFCFA(stats.totalWithdrawals)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-dashed border-slate-300">
                      <span>FLUX NET :</span>
                      <span>{stats.netVariation >= 0 ? '+' : ''}{formatFCFA(stats.netVariation)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>FLOTTE MOBILE :</span>
                      <span className="font-bold">{formatFCFA(totalMobileMoneyBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESPÈCES CAISSE :</span>
                      <span className="font-bold">{formatFCFA(cashBalance)}</span>
                    </div>
                    <div className="flex justify-between font-black pt-1 border-t border-slate-900 text-xs">
                      <span>TOTAL ACTIF :</span>
                      <span>{formatFCFA(totalMobileMoneyBalance + cashBalance)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-400">
                    *** MERCI DE VOTRE CONFIANCE ***<br />
                    TIVO BENIN - www.tivo.africa
                  </div>
                </div>
              </div>

              {/* Boutons d'export Ticket Seul (PDF, Image JPEG & Impression isolée) */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportPDF('tivo-export-ticket', 'tivo_ticket_caisse', true)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Télécharger PDF (Ticket)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportJPEG('tivo-export-ticket', 'tivo_ticket_caisse')}
                    className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-amber-600" />}
                    <span>Télécharger Image (JPEG)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintIsolated('tivo-export-ticket', true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le ticket thermique seul (58/80mm)</span>
                </button>
              </div>
            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* 8. BOTTOM NAVIGATION */}
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
