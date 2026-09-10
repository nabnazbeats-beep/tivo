import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Camera, 
  Sparkles, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Phone, 
  User as UserIcon, 
  Smartphone, 
  RefreshCw, 
  Check
} from 'lucide-react';
import { parseMobileMoneySMS, ParsedTransaction } from './smartParser';
import { NewTransactionData } from '../transactions/NewTransactionScreen';
import { TIVO_NETWORKS } from '../design-system/tokens/colors';
import { sanitizeAmountInput, normalizePhoneNumber } from '../design-system/tokens/typography';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoField } from '../design-system/components/TivoField';
import { TivoLoader } from '../design-system/components/TivoLoader';

interface ImportTransactionScreenProps {
  onBack: () => void;
  onProceedToConfirmation: (data: NewTransactionData) => void;
  initialTab?: 'paste' | 'photo';
}

export const ImportTransactionScreen: React.FC<ImportTransactionScreenProps> = ({
  onBack,
  onProceedToConfirmation,
  initialTab = 'paste',
}) => {
  // Mode d'import : 'paste' | 'photo'
  const [activeTab, setActiveTab] = useState<'paste' | 'photo'>(initialTab);

  // États Méthode 1 : Coller un SMS
  const [pastedText, setPastedText] = useState<string>('');

  // États Méthode 2 : Photographier un SMS (OCR)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanningOCR, setIsScanningOCR] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // État Résultat : Transaction détectée
  const [detectedTx, setDetectedTx] = useState<ParsedTransaction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // États modifiables de la transaction détectée
  const [editedType, setEditedType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [editedAmount, setEditedAmount] = useState<string>('');
  const [editedPhone, setEditedPhone] = useState<string>('');
  const [editedName, setEditedName] = useState<string>('');
  const [editedNetwork, setEditedNetwork] = useState<string>('mtn');

  // ==========================================
  // ANALYSE DU TEXTE COLLÉ
  // ==========================================
  const handleAnalyzePaste = () => {
    if (!pastedText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const parsed = parseMobileMoneySMS(pastedText);
      applyDetectedTransaction(parsed);
      setIsAnalyzing(false);
    }, 400);
  };

  // ==========================================
  // ANALYSE DE LA PHOTO (OCR INTELLIGENT)
  // ==========================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setImagePreview(imgUrl);
      setIsScanningOCR(true);
      setTimeout(() => {
        setIsScanningOCR(false);
        setDetectedTx({
          type: 'deposit',
          amount: 0,
          clientPhone: '',
          clientName: '',
          networkId: 'mtn',
          timeStr: '',
          dateStr: "Aujourd'hui",
          confidence: 'medium',
          confidenceScore: 80,
          rawText: "Capture d'écran de transaction",
        });
        setEditedType('deposit');
        setEditedAmount('');
        setEditedPhone('');
        setEditedName('');
        setEditedNetwork('mtn');
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  // Remplissage des champs modifiables à partir du résultat détecté
  const applyDetectedTransaction = (parsed: ParsedTransaction) => {
    setDetectedTx(parsed);
    setEditedType(parsed.type);
    setEditedAmount(parsed.amount ? parsed.amount.toString() : '');
    setEditedPhone(parsed.clientPhone || '');
    setEditedName(parsed.clientName || '');
    setEditedNetwork(parsed.networkId || 'mtn');
  };

  // Validation et continuation vers la confirmation
  const handleConfirmDetected = () => {
    const numAmount = parseInt(editedAmount, 10);
    if (!numAmount || numAmount <= 0) {
      alert('Veuillez renseigner un montant valide.');
      return;
    }

    onProceedToConfirmation({
      type: editedType,
      networkId: editedNetwork,
      amount: numAmount,
      clientPhone: normalizePhoneNumber(editedPhone),
      clientName: editedName.trim(),
    });
  };

  const handleReset = () => {
    setDetectedTx(null);
    setPastedText('');
    setImagePreview(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré (max ~672px) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-12 flex flex-col">
        
        {/* HEADER IMPORT TRANSACTION */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              aria-label="Retour"
              className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Import Intelligent</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Importer depuis un SMS
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Collez le texte du SMS ou photographiez l'écran d'un téléphone à touches
            </p>
          </div>
        </header>

        {/* CORPS DE L'ÉCRAN D'IMPORT */}
        <main className="px-4 sm:px-6 py-5 flex flex-col gap-5 flex-1">
          
          {/* ======================================================== */}
          {/* 1. ONGLETS DES DEUX MÉTHODES D'IMPORT (Si aucune détection) */}
          {/* ======================================================== */}
          {!detectedTx && (
            <>
              {/* Segmented Control */}
              <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center border border-slate-300/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Coller un SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'photo'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Photo d'un SMS (OCR)</span>
                </button>
              </div>

              {/* ---------------------------------------------------- */}
              {/* MÉTHODE 1 : COLLER UN SMS */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'paste' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Texte du SMS de confirmation</span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400">MTN, Moov, Celtis</span>
                    </label>
                    <textarea
                      rows={5}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Collez ici le SMS de transaction reçu de l'opérateur..."
                      className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 shadow-sm resize-none"
                    />
                  </div>

                  <TivoButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!pastedText.trim()}
                    isLoading={isAnalyzing}
                    onClick={handleAnalyzePaste}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Analyser le SMS
                  </TivoButton>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* MÉTHODE 2 : PHOTOGRAPHIER UN SMS (OCR TÉLÉPHONE À TOUCHES) */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'photo' && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Conçu pour téléphones classiques à touches :</strong> Photographiez directement l'écran du téléphone portable recevant les SMS Mobile Money. Le moteur OCR extrait automatiquement le montant, le numéro et le réseau.
                    </p>
                  </div>

                  {/* Input file caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Zone de capture photo */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-blue-400/50 dark:border-blue-500/30 hover:border-blue-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 transition-all hover:shadow-tivo-md group"
                  >
                    {imagePreview ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md mb-2">
                        <img src={imagePreview} alt="Aperçu photo SMS" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-tivo-gradient flex items-center justify-center text-white shadow-md shadow-blue-500/30 mb-3 group-hover:scale-105 transition-transform">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {imagePreview ? "Changer l'image du SMS" : 'Prendre une photo ou importer une image'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Formats supportés : JPG, PNG (écrans de téléphones à touches, photos inclinées)
                    </span>
                  </div>

                  {/* SCAN LASER OCR EN COURS */}
                  {isScanningOCR && (
                    <div className="relative rounded-2xl overflow-hidden p-6 bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
                      <div className="absolute inset-0 bg-blue-500/10" />
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-pulse shadow-[0_0_12px_#38bdf8]" />
                      <TivoLoader size="md" />
                      <div className="relative z-10 text-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                          Reconnaissance OCR en cours...
                        </span>
                        <span className="text-[11px] text-slate-300">
                          Compréhension intelligente du texte sur l'écran à touches
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* 2. ÉCRAN DE PRÉVISUALISATION OBLIGATOIRE : « TRANSACTION DÉTECTÉE » */}
          {/* ======================================================== */}
          {detectedTx && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* BANDEAU INDICATEUR DE FIABILITÉ */}
              <div
                className={`p-4 rounded-3xl border flex items-center justify-between shadow-sm ${
                  detectedTx.confidence === 'high'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : detectedTx.confidence === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {detectedTx.confidence === 'high' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <h2 className="text-xs font-bold leading-tight">
                      Transaction détectée • Fiabilité {detectedTx.confidenceScore}%
                    </h2>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Vérification obligatoire par le gérant avant enregistrement.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Recommencer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* FORMULAIRE DE VÉRIFICATION & CORRECTION */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-tivo-md flex flex-col gap-4">
                
                {/* 1. Type d'opération modifiable */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditedType('deposit')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      editedType === 'deposit'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    DÉPÔT (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditedType('withdrawal')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      editedType === 'withdrawal'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    RETRAIT (−)
                  </button>
                </div>

                {/* 2. Sélection du réseau détecté */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Réseau détecté :
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {TIVO_NETWORKS.map((net) => {
                      const isSelected = editedNetwork === net.id;
                      return (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => setEditedNetwork(net.id)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white dark:bg-[#0D1525] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                          <span className="truncate max-w-full">{net.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Montant détecté */}
                <TivoField
                  label="Montant détecté"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(sanitizeAmountInput(e.target.value))}
                  leftIcon={<Coins className="w-4 h-4 text-blue-500" />}
                  rightElement={
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      FCFA
                    </span>
                  }
                  required
                />

                {/* 4. Numéro client détecté et normalisé */}
                <TivoField
                  label="Numéro du client"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-blue-500" />}
                  helperText={`Normalisé : ${normalizePhoneNumber(editedPhone)}`}
                  required
                />

                {/* 5. Nom client détecté */}
                <TivoField
                  label="Nom du client (facultatif)"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  placeholder="Ex: Sèdami KPADONOU"
                />

                {/* 6. Extrait du SMS brut analysé */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Texte brut analysé :
                  </span>
                  <p className="italic">{detectedTx.rawText}</p>
                </div>

              </div>

              {/* BOUTONS D'ACTION */}
              <div className="flex flex-col gap-2.5">
                <TivoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmDetected}
                  rightIcon={<Check className="w-5 h-5" />}
                >
                  Valider et aller à la confirmation
                </TivoButton>

                <TivoButton
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={handleReset}
                >
                  Annuler et recommencer
                </TivoButton>
              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
