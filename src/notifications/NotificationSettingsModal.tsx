// ============================================================================
// TIVO NOTIFICATION SETTINGS MODAL — PHASE 18
// Configuration des seuils d'alerte, Push Web, Sons, Haptique et WhatsApp
// ============================================================================

import React, { useState, useRef } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  Vibrate, 
  Send, 
  Smartphone, 
  Check, 
  Wallet,
  Coins,
  Music,
  Upload,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { TIVO_NETWORKS } from '../design-system/tokens/colors';
import { 
  playNotificationSound, 
  triggerHaptic, 
  getCustomSoundName, 
  setCustomSoundData, 
  clearCustomSound 
} from './notificationEngine';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { 
    preferences, 
    updatePreferences, 
    webPushStatus, 
    requestPush 
  } = useNotifications();

  const audioInputRef = useRef<HTMLInputElement>(null);

  // État local des réglages modifiables
  const [enableSound, setEnableSound] = useState<boolean>(preferences.enableSound);
  const [enableVibration, setEnableVibration] = useState<boolean>(preferences.enableVibration);
  const [supervisorPhone, setSupervisorPhone] = useState<string>(preferences.supervisorPhone);
  const [customSoundName, setCustomSoundName] = useState<string | null>(getCustomSoundName());
  
  const [mtnThreshold, setMtnThreshold] = useState<number>(preferences.fleetMinThresholds.mtn);
  const [moovThreshold, setMoovThreshold] = useState<number>(preferences.fleetMinThresholds.moov);
  const [celtisThreshold, setCeltisThreshold] = useState<number>(preferences.fleetMinThresholds.celtis);
  const [smtThreshold, setSmtThreshold] = useState<number>(preferences.fleetMinThresholds.smt);

  const [cashMin, setCashMin] = useState<number>(preferences.cashMinThreshold);
  const [cashMax, setCashMax] = useState<number>(preferences.cashMaxThreshold);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      onShowToast?.('warning', 'Format audio non supporté', 'Veuillez choisir un fichier audio MP3 ou WAV.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onShowToast?.('warning', 'Fichier trop volumineux', 'Le fichier dépasse 4 Mo. Déposez-le directement dans public/sounds/notification.mp3.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomSoundData(dataUrl, file.name);
      setCustomSoundName(file.name);
      playNotificationSound('high');
      onShowToast?.('success', 'Son personnalisé actif ! 🎵', `Fichier "${file.name}" enregistré.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomSound = () => {
    clearCustomSound();
    setCustomSoundName(null);
    playNotificationSound('medium');
    onShowToast?.('info', 'Son réinitialisé', 'Le son standard a été rétabli.');
  };

  if (!isOpen) return null;

  const handleSave = () => {
    updatePreferences({
      enableSound,
      enableVibration,
      supervisorPhone,
      fleetMinThresholds: {
        mtn: Number(mtnThreshold) || 50000,
        moov: Number(moovThreshold) || 40000,
        celtis: Number(celtisThreshold) || 30000,
        smt: Number(smtThreshold) || 25000,
        other: 20000,
      },
      cashMinThreshold: Number(cashMin) || 25000,
      cashMaxThreshold: Number(cashMax) || 1000000,
    });

    onShowToast?.('success', 'Paramètres d’alertes enregistrés', 'Vos seuils opérationnels sont immédiatement actifs.');
    onClose();
  };

  const handleTestSound = () => {
    playNotificationSound('high');
    triggerHaptic('high');
    onShowToast?.('info', 'Test sonore émis', 'Carillon et vibration synthétisés avec succès.');
  };

  const handleTogglePush = async () => {
    if (webPushStatus.permission !== 'granted') {
      const granted = await requestPush();
      if (granted) {
        onShowToast?.('success', 'Notifications Push activées', 'Vous recevrez les alertes même en arrière-plan.');
      } else {
        onShowToast?.('warning', 'Permission refusée', 'Autorisez les notifications dans les paramètres de votre navigateur.');
      }
    } else {
      updatePreferences({ enablePush: !preferences.enablePush });
      onShowToast?.('info', preferences.enablePush ? 'Push désactivé' : 'Push activé');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#0E1526] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Paramètres d'Alertes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seuils de flotte UV, sons et alertes WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] text-xs">
          
          {/* 1. CANAUX & FEEDBACK */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              Canaux de Notification & Feedback
            </h3>

            {/* Push Web */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Notifications Push Navigateur</span>
                  {webPushStatus.permission === 'granted' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                      Autorisé
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Recevoir les alertes d'urgence même si Tivo est minimisé
                </p>
              </div>

              <button
                type="button"
                onClick={handleTogglePush}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  webPushStatus.permission === 'granted' && preferences.enablePush
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {webPushStatus.permission === 'granted' && preferences.enablePush ? 'Actif' : 'Activer'}
              </button>
            </div>

            {/* Bip Sonore & Vibrations & Fichier Audio Personnalisé */}
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Son des Notifications
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Signal sonore lors des alertes et opérations
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                </div>

                {/* État actuel du son & fichier personnalisé */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Music className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {customSoundName ? `Son actif : ${customSoundName}` : 'Son standard Tivo (ou public/sounds/notification.mp3)'}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block truncate">
                        {customSoundName ? 'Fichier audio personnalisé chargé' : 'Bip synthétisé fluide sans latence'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {customSoundName && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomSound}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Rétablir le son par défaut"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold text-[10.5px] hover:bg-amber-100 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Tester 🔊
                    </button>
                  </div>
                </div>

                {/* Bouton d'importation audio & Guide d'emplacement */}
                <div className="flex flex-col gap-1.5">
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                    accept="audio/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{customSoundName ? 'Remplacer l’audio' : 'Charger mon audio (.mp3, .wav)'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                    💡 Ou déposez votre fichier dans : <code className="bg-slate-200/70 dark:bg-slate-800 px-1 py-0.5 rounded text-[9.5px] font-mono text-slate-700 dark:text-slate-300">public/sounds/notification.mp3</code>
                  </p>
                </div>
              </div>

              {/* Retour Haptique */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Retour Haptique
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Vibrations tactiles sur mobile lors des alertes
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableVibration}
                  onChange={(e) => setEnableVibration(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
              </div>
            </div>
          </div>

          {/* 2. NUMÉRO DU SUPERVISEUR / GÉRANT (WHATSAPP D'URGENCE) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              Superviseur / Propriétaire (Alerte WhatsApp)
            </h3>
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
              <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                Numéro WhatsApp du superviseur (avec indicatif +229)
              </label>
              <input
                type="tel"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1.5">
                En cas de solde critique ou d'escroquerie, les caissiers pourront alerter ce numéro d’un seul tap par WhatsApp pré-rempli.
              </p>
            </div>
          </div>

          {/* 3. SEUILS D'ALERTE FLOTTE PAR RÉSEAU */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-indigo-500" />
              Seuils Minima Flotte UV (en FCFA)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Une alerte est générée dès que le solde disponible passe sous ce montant :
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* MTN MoMo */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-[11px]">
                    {TIVO_NETWORKS[0].name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={mtnThreshold}
                    onChange={(e) => setMtnThreshold(Number(e.target.value))}
                    step="5000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>

              {/* Moov Money */}
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-blue-700 dark:text-blue-400 text-[11px]">
                    {TIVO_NETWORKS[1].name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={moovThreshold}
                    onChange={(e) => setMoovThreshold(Number(e.target.value))}
                    step="5000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>

              {/* Celtis Cash */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-[11px]">
                    {TIVO_NETWORKS[2].name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={celtisThreshold}
                    onChange={(e) => setCeltisThreshold(Number(e.target.value))}
                    step="5000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>

              {/* SMT */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-purple-700 dark:text-purple-400 text-[11px]">
                    {TIVO_NETWORKS[3].name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={smtThreshold}
                    onChange={(e) => setSmtThreshold(Number(e.target.value))}
                    step="5000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SEUILS CAISSE PHYSIQUE */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Seuils Caisse Physique (Espèces)
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Fond min. alerte
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={cashMin}
                    onChange={(e) => setCashMin(Number(e.target.value))}
                    step="5000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Plafond max. risque
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={cashMax}
                    onChange={(e) => setCashMax(Number(e.target.value))}
                    step="50000"
                    className="w-full h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">FCFA</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Pied de page actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer les seuils</span>
          </button>
        </div>
      </div>
    </div>
  );
};
