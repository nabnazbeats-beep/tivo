import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Camera, 
  AlertTriangle, 
  X, 
  FileBadge, 
  KeyRound,
  Info
} from 'lucide-react';
import { useAgency, Cashier } from '../context/AgencyContext';

interface OfficialIdPhotoModalProps {
  cashier: Cashier;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const OfficialIdPhotoModal: React.FC<OfficialIdPhotoModalProps> = ({
  cashier,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { setCashierIdPhoto, unlockCashierIdPhoto } = useAgency();

  // Mode de travail : saisie nouvelle photo vs affichage certifié verrouillé
  const [photoPreview, setPhotoPreview] = useState<string | null>(cashier.idPhotoUrl || null);
  const [docNumber, setDocNumber] = useState<string>(cashier.idCardNumber || '');
  const [docType, setDocType] = useState<'cip' | 'cni' | 'passeport' | 'autre'>(cashier.idCardType || 'cip');
  const [certifiedHonour, setCertifiedHonour] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // État du modal de déverrouillage Administrateur
  const [showAdminUnlockPrompt, setShowAdminUnlockPrompt] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isLocked = Boolean(cashier.isPhotoLocked && cashier.idPhotoUrl);

  // Gestion du choix de fichier photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.('warning', 'Format invalide', 'Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    // Limite de taille 5 Mo
    if (file.size > 5 * 1024 * 1024) {
      onShowToast?.('warning', 'Image trop lourde', 'Veuillez choisir une photo inférieure à 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Enregistrement et verrouillage définitif
  const handleSaveAndLock = async () => {
    if (!photoPreview) {
      onShowToast?.('warning', 'Photo requise', 'Veuillez prendre ou téléverser une photo de profil officielle.');
      return;
    }

    if (!certifiedHonour) {
      onShowToast?.('warning', 'Attestation requise', 'Veuillez cocher la case d’engagement sur l’honneur.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = setCashierIdPhoto(cashier.id, photoPreview, docNumber, docType);
    setIsSubmitting(false);

    if (result.success) {
      onShowToast?.(
        'success',
        'Photo officielle enregistrée & verrouillée ! 🔒',
        `La photo de profil CNI/CIP de ${cashier.name} est certifiée. Elle ne peut plus être modifiée.`
      );
    } else {
      onShowToast?.('error', 'Erreur de verrouillage', result.error || 'Impossible d’enregistrer.');
    }
  };

  // Déverrouillage exceptionnel administrateur
  const handleAdminUnlock = () => {
    setUnlockError(null);
    if (!adminPinInput.trim()) {
      setUnlockError('Veuillez saisir le code PIN Administrateur.');
      return;
    }

    const result = unlockCashierIdPhoto(cashier.id, adminPinInput.trim());
    if (result.success) {
      setShowAdminUnlockPrompt(false);
      setAdminPinInput('');
      onShowToast?.(
        'info',
        'Photo déverrouillée par l’Administrateur 🔓',
        'L’opérateur peut désormais mettre à jour sa photo d’identité officielle.'
      );
    } else {
      setUnlockError(result.error || 'Code PIN administrateur incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-white dark:bg-[#0A101D] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* EN-TÊTE FIXE OFFICIEL (Style Pièce Biométrique)          */}
        {/* ======================================================== */}
        <div className="shrink-0 relative bg-gradient-to-r from-slate-900 via-[#0C1E36] to-[#122A4E] text-white px-5 py-3.5 sm:py-4 border-b border-slate-800/80 text-center">
          <button
            onClick={onClose}
            type="button"
            aria-label="Fermer"
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold tracking-wider uppercase mb-1 border border-white/10 text-slate-300">
              <FileBadge className="w-3 h-3 text-blue-400" />
              <span>Document d'Identité Caissier</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
              Photo de Profil Officielle (CNI / CIP)
            </h2>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Opérateur de guichet : <strong className="text-white font-semibold">{cashier.name}</strong>
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CORPS DU MODAL (Défilement fluide si écran réduit)       */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          
          {/* ======================================================== */}
          {/* CAS 1 : LA PHOTO EST DÉJÀ VERROUILLÉE 🔒                 */}
          {/* ======================================================== */}
          {isLocked ? (
            <div className="space-y-3.5">
              
              {/* Badge de statut vérifié & certifié */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs">
                      Photo Certifiée & Verrouillée
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
                      Non modifiable par l'opérateur (Anti-Usurpation)
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-xs shrink-0">
                  Certifié
                </span>
              </div>

              {/* CARTE BIOMÉTRIQUE STYLE CNI / CIP */}
              <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-850 p-3.5 shadow-sm overflow-hidden">
                {/* Filigrane discret officiel */}
                <div className="absolute right-2 bottom-1 text-[44px] font-black tracking-widest text-slate-400/10 dark:text-slate-200/5 select-none pointer-events-none">
                  TIVO ID
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Cadre de la photo 3:4 officiel */}
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-blue-500/40 shadow-md bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img
                      src={cashier.idPhotoUrl}
                      alt={`Photo officielle de ${cashier.name}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Tampon filigrane de certification */}
                    <div className="absolute bottom-1 right-1 bg-blue-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>OFFICIEL</span>
                    </div>
                  </div>

                  {/* Données d'état civil & certification */}
                  <div className="flex-1 space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Nom & Prénom
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                        {cashier.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Document officiel
                      </span>
                      <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                        {cashier.idCardType?.toUpperCase() || 'CIP BÉNIN'}
                        {cashier.idCardNumber ? ` • ${cashier.idCardNumber}` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        N° Certificat Sécurisé
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                        {cashier.idCertificateId || 'CERT-BJ-874219'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Date d'enregistrement
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {cashier.idPhotoCertifiedAt
                          ? new Date(cashier.idPhotoCertifiedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Enregistré'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AVERTISSEMENT : NON MODIFIABLE */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850/80 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Cette photo est <strong>définitivement figée</strong> pour garantir la traçabilité des opérations. Seul l'<strong>Administrateur</strong> peut autoriser une mise à jour.
                </p>
              </div>

              {/* FORMULAIRE PIN ADMINISTRATEUR (si demandé) */}
              {showAdminUnlockPrompt && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      Autorisation Administrateur requise
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdminUnlockPrompt(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80">
                    Saisissez le code PIN Administrateur principal (défaut : <strong>1234</strong>).
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="Code PIN Admin..."
                      className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-center font-mono font-black text-base text-slate-900 dark:text-white tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAdminUnlock}
                      className="h-9 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                    >
                      Valider
                    </button>
                  </div>

                  {unlockError && (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                      {unlockError}
                    </span>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* ======================================================== */
            /* CAS 2 : SAISIE DE LA NOUVELLE PHOTO OFFICIELLE           */
            /* ======================================================== */
            <div className="space-y-3.5">
              
              {/* BANNIÈRE D'AVERTISSEMENT SOLENNEL */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-xs">
                    Règle de sécurité : Photo Unique & Définitive
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/80">
                    Cette photo servira de pièce d'identification officielle au guichet. <strong>Une fois validée, elle sera définitivement verrouillée 🔒</strong> et non modifiable sans accord Administrateur.
                  </p>
                </div>
              </div>

              {/* ZONE DE CAPTURE & REPÈRE BIOMÉTRIQUE (Proportion 3:4) */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => !photoPreview && fileInputRef.current?.click()}
                  className={`relative w-36 h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner group ${
                    photoPreview 
                      ? 'border-blue-500 bg-slate-900' 
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer'
                  }`}
                >
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="Aperçu photo d'identité"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {/* Repère d'alignement visage (ovale discret) */}
                      <div className="absolute inset-3 rounded-full border border-white/30 pointer-events-none" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors shadow-sm"
                        title="Supprimer pour refaire"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      {/* Guide silhouette ovale officiel */}
                      <div className="w-20 h-24 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center mb-1.5 bg-white/60 dark:bg-slate-800/60 group-hover:border-blue-400 group-hover:scale-105 transition-all">
                        <Camera className="w-6 h-6 text-blue-500 mb-0.5" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                          Visage de face
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Format CNI / CIP
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        Fond clair, sans lunettes
                      </span>
                    </div>
                  )}

                  {/* Input invisible pour l'import d'image */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Bouton d'action Prise / Choix */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{photoPreview ? 'Remplacer la photo' : 'Prendre ou Téléverser'}</span>
                </button>
              </div>

              {/* RENSEIGNEMENT FACULTATIF DU DOCUMENT D'IDENTITÉ */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Type de pièce
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  >
                    <option value="cip">CIP Bénin (NPI)</option>
                    <option value="cni">CNI Biométrique</option>
                    <option value="passeport">Passeport</option>
                    <option value="autre">Autre pièce</option>
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    N° du document / CIP (optionnel)
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ex: 0192837465"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ENGAGEMENT SUR L'HONNEUR & VERROUILLAGE */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={certifiedHonour}
                    onChange={(e) => setCertifiedHonour(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 shrink-0"
                  />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                    Je certifie sur l'honneur que cette photo d'identité est la mienne et j'accepte son <strong>verrouillage définitif 🔒</strong> dans Tivo.
                  </span>
                </label>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* PIED DE PAGE FIXE (Toujours visible et accessible)       */}
        {/* ======================================================== */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070D18]/90 backdrop-blur-sm flex items-center gap-2.5">
          {isLocked ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                Fermer
              </button>

              {!showAdminUnlockPrompt && (
                <button
                  type="button"
                  onClick={() => setShowAdminUnlockPrompt(true)}
                  className="flex-1 h-10 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Déverrouiller (Admin)</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors shrink-0"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={!photoPreview || !certifiedHonour || isSubmitting}
                onClick={handleSaveAndLock}
                className="flex-1 h-10 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span>Enregistrement...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Confirmer & Verrouiller 🔒</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
