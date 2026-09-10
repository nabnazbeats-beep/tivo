import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Users, 
  Settings2, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Save, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  AlertTriangle,
  ShieldAlert,
  Bell,
  Lock,
  Camera,
  Crown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAgency, Cashier } from '../context/AgencyContext';
import { OfficialIdPhotoModal } from './OfficialIdPhotoModal';
import { TivoHeader } from '../design-system/components/TivoHeader';
import { TivoBottomNav, NavTabId } from '../design-system/components/TivoBottomNav';
import { playNotificationSound } from '../notifications/notificationEngine';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onNewTransaction: () => void;
  onOpenAudit?: () => void;
  onOpenNotifications?: () => void;
  onOpenPricing?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type TabSection = 'agency' | 'cashiers' | 'preferences';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigateTab,
  onNewTransaction,
  onOpenAudit,
  onOpenNotifications,
  onOpenPricing,
  onShowToast,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    profile,
    settings,
    cashiers,
    activeCashier,
    updateAgencyProfile,
    updateAppSettings,
    switchCashier,
    addCashier,
    deleteCashier,
    exportBackupJson,
    importBackupJson,
    factoryReset,
  } = useAgency();

  const [activeSection, setActiveSection] = useState<TabSection>('agency');

  // Formulaire Point de Vente
  const [agencyForm, setAgencyForm] = useState({ ...profile });

  // Modal Ajout Caissier
  const [showAddCashierModal, setShowAddCashierModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierPhone, setNewCashierPhone] = useState('+229 ');
  const [newCashierRole, setNewCashierRole] = useState<'admin' | 'gerant' | 'caissier'>('caissier');
  const [newCashierPin, setNewCashierPin] = useState('0000');
  const [newCashierShift, setNewCashierShift] = useState('Équipe Matin (07h30 - 14h30)');

  // Modal Photo Officielle d'Identité CNI / CIP
  const [selectedCashierForPhoto, setSelectedCashierForPhoto] = useState<Cashier | null>(null);
  const [showIdPhotoModal, setShowIdPhotoModal] = useState(false);

  // Modal Switch Caissier Rapide
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Modal Réinitialisation Usine
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  // 1. Sauvegarde du formulaire de l'agence
  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyProfile(agencyForm);
    onShowToast?.('success', 'Profil mis à jour', 'Les coordonnées de votre point de vente ont été enregistrées.');
  };

  // 2. Création d'un caissier
  const handleCreateCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) {
      onShowToast?.('warning', 'Nom requis', 'Veuillez saisir le nom du caissier.');
      return;
    }
    const res = addCashier({
      name: newCashierName.trim(),
      phone: newCashierPhone.trim(),
      role: newCashierRole,
      pin: newCashierPin.trim() || '0000',
      shift: newCashierShift.trim(),
    });

    if (res.success) {
      onShowToast?.('success', 'Opérateur ajouté', `${newCashierName} a été ajouté à votre équipe.`);
      setNewCashierName('');
      setNewCashierPhone('+229 ');
      setNewCashierPin('0000');
      setShowAddCashierModal(false);
    }
  };

  // 3. Changement d'opérateur actif
  const handleSwitchToCashier = (c: Cashier) => {
    switchCashier(c.id);
    setShowSwitchModal(false);
    onShowToast?.(
      'info',
      'Opérateur en service changé',
      `Session active : ${c.name} (${c.role.toUpperCase()})`
    );
  };

  // 4. Suppression d'un caissier
  const handleDeleteCashier = (c: Cashier) => {
    const res = deleteCashier(c.id);
    if (res.success) {
      onShowToast?.('info', 'Opérateur supprimé', `${c.name} a été retiré de votre équipe.`);
    } else {
      onShowToast?.('error', 'Action refusée', res.error || 'Impossible de supprimer.');
    }
  };

  // 5. Importation JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        onShowToast?.('success', 'Sauvegarde restaurée ! 🎉', 'Toutes les données et paramètres ont été restaurés.');
      } else {
        onShowToast?.('error', 'Échec de restauration', res.error || 'Fichier invalide.');
      }
    };
    reader.readAsText(file);
  };

  // 6. Réinitialisation usine
  const handleExecuteReset = () => {
    if (resetConfirmInput.trim() !== 'RESET') {
      onShowToast?.('error', 'Confirmation incorrecte', 'Veuillez taper RESET en majuscules pour confirmer.');
      return;
    }
    factoryReset();
    setShowResetConfirmModal(false);
    setResetConfirmInput('');
    onShowToast?.('info', 'Réinitialisation terminée', 'L’application a été restaurée à son état d’origine.');
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First centré */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-28 flex flex-col">
        
        {/* EN-TÊTE FIXE */}
        <TivoHeader
          title="Profil & Paramètres"
          subtitle="Point de vente & Multi-opérateurs"
          showBack
          onBack={onBack}
        />

        <main className="px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">

          {/* ======================================================== */}
          {/* 1. HERO CARTE PROFIL & OPÉRATEUR ACTIF */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 rounded-3xl shadow-tivo-md relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                {/* Avatar Initiale */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shrink-0">
                  {activeCashier.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base md:text-lg font-black leading-tight text-white truncate">
                      {activeCashier.name}
                    </h2>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 shrink-0">
                      {activeCashier.role === 'admin' ? 'Propriétaire' : activeCashier.role === 'gerant' ? 'Gérant' : 'Caissier'}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-blue-100/90 mt-0.5 truncate">
                    {profile.agencyName} • {profile.city}
                  </p>
                </div>
              </div>

              {/* Bouton Switch Rapide */}
              <button
                onClick={() => setShowSwitchModal(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-all shrink-0 shadow-sm ml-2"
              >
                <span>Changer</span>
                <span>⇄</span>
              </button>
            </div>

            {/* Micro badges d'état du point */}
            <div className="relative z-10 grid grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs">
              <div className="bg-white/10 rounded-xl p-2 min-w-0">
                <span className="text-[10px] text-blue-200 block truncate">Poste en cours</span>
                <span className="font-semibold text-white truncate block text-[11px] mt-0.5">
                  {activeCashier.shift}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2 min-w-0">
                <span className="text-[10px] text-blue-200 block truncate">Équipe configurée</span>
                <span className="font-bold text-white block text-[11px] mt-0.5 truncate">
                  {cashiers.length} opérateur{cashiers.length > 1 ? 's' : ''} actif{cashiers.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BANDEAU FORMULE & ABONNEMENT TIVO */}
          {/* ======================================================== */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Crown className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Formule {user?.plan === 'business' ? 'MAX (Business)' : user?.plan === 'pro' ? 'PRO (Kiosque)' : 'BASIC (Découverte)'}
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.plan === 'business'
                    ? 'Kiosques illimités & supervision complète'
                    : user?.plan === 'pro'
                    ? 'Scan OCR, multi-opérateurs & clôture scellée'
                    : 'Mode d’essai sans frais (30 tx/mois)'}
                </p>
              </div>
            </div>

            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Offres</span>
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. ONGLETS DE SECTION (Point de Vente | Équipe | Préférences) */}
          {/* ======================================================== */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('agency')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 truncate ${
                activeSection === 'agency'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Agence</span>
            </button>
            <button
              onClick={() => setActiveSection('cashiers')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 truncate ${
                activeSection === 'cashiers'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Équipe ({cashiers.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('preferences')}
              className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 truncate ${
                activeSection === 'preferences'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Options</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1 : POINT DE VENTE (IDENTITÉ & COORDONNÉES) */}
          {/* ======================================================== */}
          {activeSection === 'agency' && (
            <form onSubmit={handleSaveAgency} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Informations du Kiosque
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Kiosque Agréé Bénin 🇧🇯
                </span>
              </div>

              {/* Nom de l'enseigne */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nom du point de vente / Kiosque *
                </label>
                <input
                  type="text"
                  required
                  value={agencyForm.agencyName}
                  onChange={(e) => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                  placeholder="Ex: Kiosque Tivo Akpakpa Centre"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Responsable & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gérant responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyForm.agentName}
                    onChange={(e) => setAgencyForm({ ...agencyForm, agentName: e.target.value })}
                    placeholder="Nazirou GBADAMASSI"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Téléphone kiosque *
                  </label>
                  <input
                    type="tel"
                    required
                    value={agencyForm.phone}
                    onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                    placeholder="+229 97 45 12 89"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Localisation & Quartier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyForm.city}
                    onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                    placeholder="Cotonou"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Quartier / Repère
                  </label>
                  <input
                    type="text"
                    value={agencyForm.district}
                    onChange={(e) => setAgencyForm({ ...agencyForm, district: e.target.value })}
                    placeholder="Akpakpa Dodomè (Ciné Concorde)"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Numéro IFU */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Numéro IFU (Identifiant Fiscal Unique)
                </label>
                <input
                  type="text"
                  value={agencyForm.ifuNumber}
                  onChange={(e) => setAgencyForm({ ...agencyForm, ifuNumber: e.target.value })}
                  placeholder="0202114896521"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Message de bas de ticket */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pied de ticket / Message de reçu
                </label>
                <input
                  type="text"
                  value={agencyForm.receiptFooter}
                  onChange={(e) => setAgencyForm({ ...agencyForm, receiptFooter: e.target.value })}
                  placeholder="Merci de votre fidélité • Partenaire officiel MTN, Moov & Celtis"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les coordonnées de l'agence</span>
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* SECTION 2 : ÉQUIPE & CAISSIERS (MULTI-COMPTES GÉRANTS) */}
          {/* ======================================================== */}
          {activeSection === 'cashiers' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Opérateurs & Caissiers
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chaque caissier enregistre ses flux sous son nom
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddCashierModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Caissier</span>
                  </button>
                </div>

                {/* CARTE MISE EN AVANT : PHOTO D'IDENTITÉ DE L'OPÉRATEUR ACTIF */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 border border-blue-500/20 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-blue-500/40 bg-slate-100 dark:bg-slate-800 shadow-sm shrink-0">
                      {activeCashier.idPhotoUrl ? (
                        <img
                          src={activeCashier.idPhotoUrl}
                          alt={activeCashier.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <Camera className="w-5 h-5 text-blue-500" />
                          <span className="text-[8px] font-bold mt-0.5">CNI</span>
                        </div>
                      )}
                      {activeCashier.isPhotoLocked && activeCashier.idPhotoUrl && (
                        <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-tl">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Opérateur en service • Pièce Officielle
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {activeCashier.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeCashier.isPhotoLocked && activeCashier.idPhotoUrl
                          ? 'Photo d’identité certifiée & verrouillée 🔒'
                          : 'Photo d’identité officielle non renseignée'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCashierForPhoto(activeCashier);
                      setShowIdPhotoModal(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    {activeCashier.isPhotoLocked ? <Lock className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>{activeCashier.isPhotoLocked ? 'Voir CNI' : '+ Photo CNI'}</span>
                  </button>
                </div>

                {/* Liste des caissiers */}
                <div className="space-y-2.5">
                  {cashiers.map((c) => {
                    const isCurrent = c.id === activeCashier.id;

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 shadow-sm ring-1 ring-blue-400'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {c.idPhotoUrl ? (
                            <div className="relative w-10 h-12 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                              <img src={c.idPhotoUrl} alt={c.name} className="w-full h-full object-cover" />
                              {c.isPhotoLocked && (
                                <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-0.5 rounded-tl">
                                  <Lock className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className={`w-10 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              isCurrent
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                                {c.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                  En service
                                </span>
                              )}
                              {c.isPhotoLocked && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Certifié</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {c.shift} • {c.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCashierForPhoto(c);
                              setShowIdPhotoModal(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors flex items-center gap-1"
                            title="Gérer la photo d'identité officielle"
                          >
                            {c.isPhotoLocked ? <Lock className="w-3 h-3 text-emerald-600" /> : <Camera className="w-3 h-3 text-amber-500" />}
                            <span className="text-[10px]">{c.isPhotoLocked ? 'CNI 🔒' : '+ CNI'}</span>
                          </button>

                          {!isCurrent ? (
                            <button
                              onClick={() => handleSwitchToCashier(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                            >
                              Activer
                            </button>
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </span>
                          )}

                          {c.id !== 'csh_admin' && (
                            <button
                              onClick={() => handleDeleteCashier(c)}
                              className="w-8 h-8 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors"
                              title="Supprimer ce caissier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Matrice des droits */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm text-xs">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Permissions & Responsabilités
                  </h4>
                </div>
                <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
                  <p>• <strong>Propriétaire (Admin)</strong> : Accès intégral, clôture scellée, export comptable, gestion des fonds et suppressions.</p>
                  <p>• <strong>Gérant</strong> : Enregistrement de transactions, gestion des dettes, arrêt de caisse et export WhatsApp de fin de poste.</p>
                  <p>• <strong>Caissier</strong> : Saisie rapide des dépôts/retraits et avances. Aucune modification de paramètres d'agence.</p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3 : OPTIONS & SAUVEGARDES SYSTÈME */}
          {/* ======================================================== */}
          {activeSection === 'preferences' && (
            <div className="space-y-4">
              
              {/* Toggles Préférences */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-500" />
                  <span>Préférences de Saisie & Interface</span>
                </h3>

                {/* Sons & Bips */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Signaux sonores de validation
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Bip audio lors de la validation d'une transaction
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !settings.soundEnabled;
                      updateAppSettings({ soundEnabled: next });
                      if (next) playNotificationSound('medium');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white block shadow transform transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Vibrations haptiques */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Retours haptiques (Vibrations)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Vibration lors des appuis de touches sur mobile
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateAppSettings({ hapticEnabled: !settings.hapticEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.hapticEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white block shadow transform transition-transform ${settings.hapticEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Saisie intelligente par Photo OCR & SMS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Saisie par Photo OCR & SMS
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Activer la prise de photo d'écran et la lecture des SMS sur la saisie
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateAppSettings({ enableOcrAndSmsImport: !settings.enableOcrAndSmsImport })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.enableOcrAndSmsImport !== false ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white block shadow transform transition-transform ${settings.enableOcrAndSmsImport !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Thème clair / sombre */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Thème de l'application
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Actuellement en mode {theme === 'dark' ? 'Sombre (Contraste élevé)' : 'Clair'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {theme === 'dark' ? 'Mode Clair ☀️' : 'Mode Sombre 🌙'}
                  </button>
                </div>
              </div>

              {/* Sauvegardes & Restauration */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Sauvegardes & Restauration (JSON)</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Exportez une copie intégrale de vos transactions, dettes, caisse et soldes pour archivage sécurisé sur ordinateur ou clé USB.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Export JSON */}
                  <button
                    onClick={() => {
                      exportBackupJson();
                      onShowToast?.('success', 'Sauvegarde téléchargée', 'Fichier JSON généré avec succès.');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800/80 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sauvegarde JSON</span>
                  </button>

                  {/* Import JSON */}
                  <label className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restaurer JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Sécurité & Audit Trail (Phase 17) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Sécurité & Journal d'Audit
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Certifié BCEAO
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consultez le journal des actions infalsifiables horodatées, le scanneur d'anomalies de débits et les alertes anti-fraude.
                </p>
                {onOpenAudit && (
                  <button
                    onClick={onOpenAudit}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Ouvrir le Centre de Sécurité & Audit</span>
                  </button>
                )}
              </div>

              {/* Centre d'Alertes & Notifications (Phase 18) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Centre d'Alertes & Notifications
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Seuils & Push
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gérez vos seuils d'alerte flotte UV (MTN, Moov, Celtis, SMT), configurez les notifications Push Web, les sons et le contact WhatsApp du superviseur.
                </p>
                {onOpenNotifications && (
                  <button
                    onClick={onOpenNotifications}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Ouvrir les Notifications & Seuils</span>
                  </button>
                )}
              </div>

              {/* Zone Dangereuse : Réinitialisation & Déconnexion */}
              <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Zone Critique
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => setShowResetConfirmModal(true)}
                    className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser les données d'usine</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se déconnecter de Tivo</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* BOTTOM NAV FIXE */}
        <TivoBottomNav
          activeTab="settings"
          onTabChange={onNavigateTab}
          onAddClick={onNewTransaction}
        />

        {/* ======================================================== */}
        {/* MODAL 1 : AJOUT D'UN CAISSIER */}
        {/* ======================================================== */}
        {showAddCashierModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Ajouter un Caissier
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Créer un accès pour un membre de votre kiosque
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCashierModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCashier} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom & Prénom de l'opérateur *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    placeholder="Ex: Aïchatou TOSSOU"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={newCashierPhone}
                    onChange={(e) => setNewCashierPhone(e.target.value)}
                    placeholder="+229 97 00 11 22"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Rôle & Niveau d'accès
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'caissier', label: 'Caissier' },
                      { id: 'gerant', label: 'Gérant' },
                      { id: 'admin', label: 'Admin' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setNewCashierRole(r.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          newCashierRole === r.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Code PIN (4 chiffres)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newCashierPin}
                      onChange={(e) => setNewCashierPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="0000"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Shift / Horaire
                    </label>
                    <input
                      type="text"
                      value={newCashierShift}
                      onChange={(e) => setNewCashierShift(e.target.value)}
                      placeholder="Matin, Soir..."
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-tivo-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Enregistrer l'opérateur</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2 : CHANGER D'OPÉRATEUR EN SERVICE */}
        {/* ======================================================== */}
        {showSwitchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Passer la main
                  </h3>
                </div>
                <button
                  onClick={() => setShowSwitchModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Sélectionnez le gérant qui prend son service au comptoir :
              </p>

              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {cashiers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSwitchToCashier(c)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      c.id === activeCashier.id
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs block text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {c.shift}
                      </span>
                    </div>
                    {c.id === activeCashier.id && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Actuel ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3 : CONFIRMATION RÉINITIALISATION USINE */}
        {/* ======================================================== */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Réinitialisation Usine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                Cette action supprimera toutes les transactions, dettes, clôtures et paramètres enregistrés sur cet appareil.
                <br /><br />
                Tapez <strong>RESET</strong> pour confirmer :
              </p>

              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Tapez RESET"
                className="w-full h-11 px-3 text-center text-sm font-black font-mono tracking-widest rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-600 uppercase mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowResetConfirmModal(false);
                    setResetConfirmInput('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExecuteReset}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                >
                  Effacer tout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL PHOTO D'IDENTITÉ OFFICIELLE (CNI / CIP) */}
        {/* ======================================================== */}
        <OfficialIdPhotoModal
          cashier={selectedCashierForPhoto || activeCashier}
          isOpen={showIdPhotoModal}
          onClose={() => {
            setShowIdPhotoModal(false);
            setSelectedCashierForPhoto(null);
          }}
          onShowToast={onShowToast}
        />

      </div>
    </div>
  );
};
