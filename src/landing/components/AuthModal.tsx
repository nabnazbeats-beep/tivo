import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Store, 
  Crown, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Zap, 
  ShieldCheck
} from 'lucide-react';
import { useAuth, SubscriptionPlan } from '../../context/AuthContext';
import { TivoField } from '../../design-system/components/TivoField';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialPlan?: SubscriptionPlan;
  initialBillingCycle?: 'monthly' | 'annual';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  initialPlan = 'pro',
  initialBillingCycle = 'annual',
  onSuccess,
}) => {
  const { login, signup, quickDemoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [kioskName, setKioskName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'gerant' | 'admin'>('gerant');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'moov' | 'celtis' | 'wave' | 'card'>('momo');

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync props when opening
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedPlan(initialPlan);
      setBillingCycle(initialBillingCycle);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode, initialPlan, initialBillingCycle]);

  if (!isOpen) return null;

  // Soumission Inscription
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Fallback email si non fourni
    const cleanEmail = email.trim() || `${phone.replace(/\D/g, '') || 'kiosque'}@tivo.local`;

    const result = await signup(
      name.trim(),
      cleanEmail,
      password,
      selectedPlan === 'business' ? 'admin' : 'gerant',
      selectedPlan,
      {
        phone,
        kioskName,
        billingCycle,
      }
    );

    setLoading(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || "Erreur lors de l'enregistrement.");
    }
  };

  // Soumission Connexion
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const result = await login(loginEmail, loginPassword, selectedRole);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Identifiants invalides.');
    }
  };

  // Démo en 1 clic
  const handleDemo = (role: 'gerant' | 'admin' | 'caissier') => {
    quickDemoLogin(role, selectedPlan);
    onSuccess();
    onClose();
  };

  // Tarifs d'affichage
  const planPrices = {
    free: { monthly: '0 FCFA', annual: '0 FCFA' },
    pro: { monthly: '4 900 FCFA', annual: '3 900 FCFA' },
    business: { monthly: '14 900 FCFA', annual: '11 900 FCFA' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BANDEAU SUPÉRIEUR & FERMETURE */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 sm:p-6 pb-6">
          {/* Bouton fermeture */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img 
              src="/logo-tivo.png" 
              alt="Logo TIVO" 
              className="w-11 h-11 rounded-xl object-contain bg-white/10 p-1 shadow-md"
            />
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {mode === 'signup' ? 'Bienvenue sur TIVO' : 'Connexion à votre espace'}
              </h3>
              <p className="text-xs text-blue-100">
                {mode === 'signup' 
                  ? 'Activez votre compte pour gérer votre kiosque en toute rigueur' 
                  : 'Retrouvez votre caisse et vos comptes opérateurs'}
              </p>
            </div>
          </div>

          {/* Onglets Connexion / Inscription */}
          <div className="mt-4 p-1 rounded-xl bg-black/20 flex items-center gap-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Créer un compte & S'abonner
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Déjà inscrit ? Se connecter
            </button>
          </div>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================
              MODE INSCRIPTION / ABONNEMENT
             ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* SÉLECTION DU PALIER D'ABONNEMENT */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Formule sélectionnée :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Basic */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('free')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedPlan === 'free'
                        ? 'border-slate-800 dark:border-white bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-400/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">Basic</span>
                      {selectedPlan === 'free' && <Check className="w-3 h-3 text-slate-900 dark:text-white" />}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">7j Pro Offerts</span>
                  </button>

                  {/* Pro */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('pro')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      selectedPlan === 'pro'
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        Pro
                      </span>
                      {selectedPlan === 'pro' && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {billingCycle === 'annual' ? '3 900 F' : '4 900 F'}
                    </span>
                  </button>

                  {/* Business */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('business')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedPlan === 'business'
                        ? 'border-pink-600 dark:border-pink-400 bg-pink-50 dark:bg-pink-950/40 ring-2 ring-pink-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-extrabold text-pink-600 dark:text-pink-400">Max</span>
                      {selectedPlan === 'business' && <Check className="w-3 h-3 text-pink-600 dark:text-pink-400" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {billingCycle === 'annual' ? '11 900 F' : '14 900 F'}
                    </span>
                  </button>
                </div>
              </div>

              {/* RAPPEL DU PLAN SÉLECTIONNÉ */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0E1526] border border-slate-200/80 dark:border-slate-800/80 text-xs flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedPlan === 'free' ? 'Plan Basic (Découverte)' : selectedPlan === 'pro' ? 'Plan Pro Kiosque (Recommandé)' : 'Plan Max Business (Flottes)'}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedPlan === 'free'
                      ? 'Sans frais, 30 tx/mois, sans carte'
                      : `${planPrices[selectedPlan][billingCycle]} / mois (${billingCycle === 'annual' ? 'Facturé annuellement avec 2 mois offerts' : 'Sans engagement'})`}
                  </p>
                </div>
                {selectedPlan !== 'free' && (
                  <button
                    type="button"
                    onClick={() => setBillingCycle(b => b === 'annual' ? 'monthly' : 'annual')}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30"
                  >
                    {billingCycle === 'annual' ? 'Passer en mensuel' : 'Passer en annuel (-20%)'}
                  </button>
                )}
              </div>

              {/* CHAMPS D'INSCRIPTION */}
              <div className="space-y-3">
                <TivoField
                  label="Nom complet du gérant"
                  placeholder="Ex: Nazirou GBADAMASSI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TivoField
                    label="Numéro WhatsApp (Mobile Money)"
                    type="tel"
                    placeholder="Ex: +229 97 00 11 22"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                    required
                  />

                  <TivoField
                    label="Nom de votre Kiosque / Agence"
                    placeholder="Ex: Kiosque Étoile Rouge"
                    value={kioskName}
                    onChange={(e) => setKioskName(e.target.value)}
                    leftIcon={<Store className="w-4 h-4 text-slate-400" />}
                    required
                  />
                </div>

                <TivoField
                  label="Adresse Email"
                  type="email"
                  placeholder="Ex: contact@kiosque.bj"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <TivoField
                  label="Mot de passe"
                  isPassword
                  placeholder="Au moins 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              {/* MOYEN DE RÈGLEMENT (Simulation pour les plans payants) */}
              {selectedPlan !== 'free' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Moyen de paiement Mobile Money :
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-black text-slate-900">M</span>
                      <span className="text-[10px]">MTN MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('moov')}
                      className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'moov'
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-black text-white">M</span>
                      <span className="text-[10px]">Moov</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('celtis')}
                      className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'celtis'
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white">C</span>
                      <span className="text-[10px]">Celtis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wave')}
                      className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'wave'
                          ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 ring-1 ring-sky-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-sky-400 flex items-center justify-center text-[9px] font-black text-white">W</span>
                      <span className="text-[10px]">Wave</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Paiement 100% sécurisé • 7 jours d'essai offerts</span>
                  </p>
                </div>
              )}

              {/* BOUTON DE SOUMISSION COMPACT (FLÈCHE STRICTEMENT À DROITE & HAUTEUR RÉDUITE) */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Chargement...</span>
                  </span>
                ) : (
                  <>
                    <span className="whitespace-nowrap">
                      {selectedPlan === 'free' 
                        ? 'Démarrer l\'Essai Gratuit 7 Jours (Accès Pro)' 
                        : `Confirmer & Démarrer avec le Plan ${selectedPlan.toUpperCase()}`}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              MODE CONNEXION RAPIDE
             ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Choix rôle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('gerant')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedRole === 'gerant'
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span className="text-xs">Espace Gérant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedRole === 'admin'
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs">Superviseur Admin</span>
                </button>
              </div>

              <TivoField
                label="Email ou Numéro de téléphone"
                placeholder="Ex: gerant@tivo.bj ou 97001122"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <TivoField
                label="Mot de passe"
                isPassword
                placeholder="Votre mot de passe"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              {/* BOUTON DE CONNEXION COMPACT (FLÈCHE STRICTEMENT À DROITE & HAUTEUR RÉDUITE) */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Connexion...</span>
                  </span>
                ) : (
                  <>
                    <span className="whitespace-nowrap">Se connecter</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ACCÈS DÉMO RAPIDE EN 1 CLIC */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Ou testez immédiatement sans mot de passe :
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('gerant')}
                className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>Démo Gérant</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('caissier')}
                className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Démo Caissier</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Démo Admin</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
