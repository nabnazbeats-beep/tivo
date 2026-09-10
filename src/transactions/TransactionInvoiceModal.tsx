import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Receipt, 
  MessageSquare, 
  Send, 
  QrCode,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Transaction } from '../context/TransactionContext';
import { useAgency } from '../context/AgencyContext';
import { TIVO_NETWORKS, NetworkConfig } from '../design-system/tokens/colors';
import { formatFCFA } from '../design-system/tokens/typography';
import { TivoButton } from '../design-system/components/TivoButton';
import { exportElementAsImage, exportElementAsPDF, printElementOnly } from '../utils/exportDocument';

interface TransactionInvoiceModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type InvoiceFormat = 'pdf' | 'receipt' | 'whatsapp';

export const TransactionInvoiceModal: React.FC<TransactionInvoiceModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { profile, activeCashier } = useAgency();
  const [activeFormat, setActiveFormat] = useState<InvoiceFormat>('pdf');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !transaction) return null;

  const network: NetworkConfig =
    TIVO_NETWORKS.find((n) => n.id === transaction.networkId) || TIVO_NETWORKS[0];

  const isDeposit = transaction.type === 'deposit';

  // Formatage de la date
  const txDate = new Date(transaction.timestamp);
  const fullDateStr = txDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = transaction.timeStr || txDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Message WhatsApp préformaté pour le client
  const clientWhatsAppMessage = `🧾 *REÇU OFFICIEL DE TRANSACTION — TIVO*\n` +
    `🏪 *Point :* ${profile.agencyName}\n` +
    `📍 *Lieu :* ${profile.district}, ${profile.city}\n` +
    `--------------------------------\n` +
    `🔢 *Réf :* ${transaction.id}\n` +
    `📅 *Date :* ${fullDateStr} à ${timeStr}\n` +
    `📶 *Réseau :* ${network.name}\n` +
    `⚡ *Opération :* ${isDeposit ? 'DÉPÔT D’ARGENT' : 'RETRAIT D’ARGENT'}\n` +
    `👤 *Bénéficiaire/Client :* ${transaction.clientPhone} ${transaction.clientName ? `(${transaction.clientName})` : ''}\n` +
    `💵 *Montant :* *${formatFCFA(transaction.amount)}*\n` +
    `👤 *Caissier en service :* ${activeCashier.name}\n` +
    `--------------------------------\n` +
    `🔒 _Opération sécurisée & certifiée par Tivo Mobile Money._\n` +
    `${profile.receiptFooter}`;

  // Copier le reçu WhatsApp
  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(clientWhatsAppMessage);
    setCopied(true);
    onShowToast?.('success', 'Reçu copié !', 'Le texte du reçu est dans votre presse-papier.');
    setTimeout(() => setCopied(false), 2500);
  };

  // Envoi WhatsApp direct au client
  const handleSendClientWhatsApp = () => {
    const cleanPhone = transaction.clientPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(clientWhatsAppMessage);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  // ========================================================
  // EXPORT DOCUMENT SEUL (PDF, JPEG & IMPRESSION ISOLÉE)
  // ========================================================
  const handleExportPDF = async (elementId: string, baseName: string, isTicket = false) => {
    setIsExporting(true);
    onShowToast?.('info', 'Génération PDF...', 'Création du document officiel sans interface.');
    try {
      const filename = `${baseName}_${transaction.id}`;
      const success = await exportElementAsPDF(elementId, filename, isTicket);
      if (success) {
        onShowToast?.('success', 'PDF téléchargé !', 'Facture générée avec succès.');
      } else {
        onShowToast?.('error', 'Erreur export', 'Impossible de générer le fichier PDF.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJPEG = async (elementId: string, baseName: string) => {
    setIsExporting(true);
    onShowToast?.('info', 'Génération image...', 'Capture JPEG haute résolution.');
    try {
      const filename = `${baseName}_${transaction.id}`;
      const success = await exportElementAsImage(elementId, filename, 'jpeg');
      if (success) {
        onShowToast?.('success', 'Image JPEG téléchargée !', 'Reçu enregistré sous format image.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0E1524] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* EN-TÊTE DU MODAL */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Receipt className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Facture & Reçu de Caisse
              </h2>
              <p className="text-[11px] text-blue-100/90 font-mono">
                Réf: {transaction.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ONGLETS DES FORMATS (PDF A4, TICKET POS, WHATSAPP) */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveFormat('pdf')}
              className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeFormat === 'pdf'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Facture PDF A4</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat('receipt')}
              className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeFormat === 'receipt'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ticket POS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormat('whatsapp')}
              className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeFormat === 'whatsapp'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* CORPS DÉFILANT AVEC APERÇU SELON LE FORMAT CHOISI */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* ======================================================== */}
          {/* FORMAT 1 : FACTURE / REÇU PDF A4 OFFICIEL                */}
          {/* ======================================================== */}
          {activeFormat === 'pdf' && (
            <div className="space-y-4 animate-fade-in">
              {/* Feuille A4 visuelle stylisée (Document seul exportable) */}
              <div
                id="tivo-invoice-a4"
                className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-md font-sans space-y-4"
              >
                {/* En-tête de l'Agence */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo-tivo.png"
                      alt="Logo Tivo"
                      className="w-12 h-12 rounded-xl object-contain shadow-xs border border-slate-100"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {profile.agencyName}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {profile.district}, {profile.city} • Tél: {profile.phone}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        IFU : {profile.ifuNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                      FACTURE ACQUITTÉE
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-600 block mt-1">
                      N° {transaction.id}
                    </span>
                  </div>
                </div>

                {/* Détails Client & Opérateur */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Client / Bénéficiaire
                    </span>
                    <span className="font-extrabold text-slate-900 block">
                      {transaction.clientName || 'Client Comptoir'}
                    </span>
                    <span className="font-mono text-slate-600">
                      {transaction.clientPhone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Caissier en service
                    </span>
                    <span className="font-extrabold text-slate-900 block">
                      {activeCashier.name}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {activeCashier.isPhotoLocked ? 'Identité Certifiée 🔒' : 'Opérateur Guichet'}
                    </span>
                  </div>
                </div>

                {/* Tableau financier de la transaction */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold">
                      <tr>
                        <th className="p-2.5">Désignation</th>
                        <th className="p-2.5">Réseau</th>
                        <th className="p-2.5 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5">
                          <span className="font-extrabold block">
                            {isDeposit ? 'Dépôt Mobile Money' : 'Retrait Mobile Money'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {fullDateStr} à {timeStr}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold"
                            style={{ backgroundColor: network.color, color: network.id === 'mtn' ? '#713F12' : '#FFFFFF' }}
                          >
                            {network.name}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-black font-mono text-sm text-slate-900">
                          {formatFCFA(transaction.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Récapitulatif Total & QR Code de certification */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg p-1 border border-slate-200 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">
                        Certificat Tivo Secure
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        HASH: {transaction.id.slice(0, 12).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Réglé en Espèces
                    </span>
                    <span className="text-lg font-black text-blue-600 font-mono">
                      {formatFCFA(transaction.amount)}
                    </span>
                  </div>
                </div>

                {/* Pied de facture légal */}
                <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
                  {profile.receiptFooter} • Logiciel certifié Tivo v1.0
                </div>
              </div>

              {/* Boutons d'export Document Seul */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportPDF('tivo-invoice-a4', 'facture_tivo', false)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Télécharger PDF</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportJPEG('tivo-invoice-a4', 'facture_tivo')}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-blue-600" />}
                    <span>Télécharger Image (JPEG)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintIsolated('tivo-invoice-a4', false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800/60 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer la Facture (Document seul)</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORMAT 2 : TICKET THERMIQUE POS (58mm / 80mm)            */}
          {/* ======================================================== */}
          {activeFormat === 'receipt' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div
                  id="tivo-invoice-ticket"
                  className="w-full max-w-xs bg-white text-slate-900 rounded-2xl p-5 shadow-md border border-slate-200 font-mono text-[11px] space-y-2.5"
                >
                  {/* En-tête thermique */}
                  <div className="text-center pb-2 border-b border-dashed border-slate-300">
                    <img src="/logo-tivo.png" alt="Tivo" className="w-7 h-7 mx-auto rounded mb-1 object-contain" />
                    <span className="font-black text-xs block">{profile.agencyName.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-500 block">{profile.district}, {profile.city}</span>
                    <span className="text-[9px] text-slate-500 block">Tél: {profile.phone}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">IFU: {profile.ifuNumber}</span>
                  </div>

                  {/* Détails ticket */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">DATE:</span>
                      <span className="font-bold">{fullDateStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">HEURE:</span>
                      <span className="font-bold">{timeStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TICKET N°:</span>
                      <span className="font-bold">{transaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OPÉRATEUR:</span>
                      <span className="font-bold">{activeCashier.name}</span>
                    </div>
                  </div>

                  {/* Ligne d'opération */}
                  <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
                    <div className="flex justify-between font-black text-xs">
                      <span>{isDeposit ? 'DÉPÔT' : 'RETRAIT'} {network.name}:</span>
                      <span>{formatFCFA(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>CLIENT:</span>
                      <span className="font-mono">{transaction.clientPhone}</span>
                    </div>
                    {transaction.clientName && (
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>NOM:</span>
                        <span>{transaction.clientName}</span>
                      </div>
                    )}
                  </div>

                  {/* Total encaissé */}
                  <div className="flex justify-between font-black text-sm pt-1">
                    <span>TOTAL :</span>
                    <span className="text-blue-600">{formatFCFA(transaction.amount)}</span>
                  </div>

                  {/* QR code miniature simulation */}
                  <div className="text-center pt-2 border-t border-dashed border-slate-300">
                    <div className="inline-block p-1 bg-slate-100 rounded">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-[8px] text-slate-400 mt-1">
                      *** MERCI DE VOTRE VISITE ***<br />
                      {profile.receiptFooter}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'export Ticket Seul */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportPDF('tivo-invoice-ticket', 'ticket_tivo', true)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Télécharger PDF</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportJPEG('tivo-invoice-ticket', 'ticket_tivo')}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-amber-600" />}
                    <span>Télécharger Image (JPEG)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintIsolated('tivo-invoice-ticket', true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Ticket (58mm / 80mm seul)</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORMAT 3 : REÇU DIRECT WHATSAPP                          */}
          {/* ======================================================== */}
          {activeFormat === 'whatsapp' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <Share2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Envoyez instantanément le reçu numérique officiel au client sur son compte WhatsApp : <strong>{transaction.clientPhone}</strong>.
                </p>
              </div>

              {/* Aperçu bulle WhatsApp */}
              <div className="bg-[#EFEAE2] dark:bg-[#0B141A] rounded-2xl p-3.5 border border-slate-300 dark:border-slate-800 shadow-inner">
                <div className="bg-white dark:bg-[#1F2C34] rounded-xl p-3.5 shadow-sm border border-slate-200/60 dark:border-slate-700 text-xs font-mono whitespace-pre-line text-slate-800 dark:text-slate-100 leading-relaxed">
                  {clientWhatsAppMessage}
                </div>
              </div>

              {/* Boutons d'action WhatsApp */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
                </button>

                <TivoButton
                  variant="primary"
                  size="lg"
                  className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 shadow-tivo-md"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSendClientWhatsApp}
                >
                  Envoyer sur WhatsApp
                </TivoButton>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
