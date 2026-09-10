import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Store, 
  Check,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TivoButton } from '../design-system/components/TivoButton';
import { TivoField } from '../design-system/components/TivoField';

export const AuthScreen: React.FC<{ 
  onAuthSuccess?: () => void;
  onBackToLanding?: () => void;
}> = ({ onAuthSuccess, onBackToLanding }) => {
  const { login, signup, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab state: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  // Sélecteur de rôle : 'gerant' (Point de vente) ou 'admin' (Supervision)
  const [selectedRole, setSelectedRole] = useState<'gerant' | 'admin'>('gerant');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Soumission Connexion
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await login(loginEmail, loginPassword, selectedRole);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(
        selectedRole === 'admin'
          ? 'Connexion réussie ! Redirection vers l’espace Administrateur...'
          : 'Connexion réussie ! Redirection vers l’espace Gérant...'
      );
      setTimeout(() => {
        onAuthSuccess?.();
      }, 500);
    } else {
      setErrorMsg(result.error || 'Identifiants invalides.');
    }
  };

  // Soumission Inscription
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const result = await signup(signupName, signupEmail, signupPassword, selectedRole);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(
        selectedRole === 'admin'
          ? 'Compte Administrateur créé avec succès ! Bienvenue sur Tivo.'
          : 'Compte Gérant créé avec succès ! Bienvenue sur Tivo.'
      );
      setTimeout(() => {
        onAuthSuccess?.();
      }, 500);
    } else {
      setErrorMsg(result.error || 'Erreur lors de la création du compte.');
    }
  };

  // Connexion démo rapide (1 clic)
  const handleQuickDemo = (role: 'gerant' | 'admin' | 'caissier') => {
    if (role === 'admin') setSelectedRole('admin');
    if (role === 'gerant') setSelectedRole('gerant');
    setLoading(true);
    setTimeout(() => {
      quickDemoLogin(role);
      setLoading(false);
      onAuthSuccess?.();
    }, 400);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-[#060a12] flex flex-col items-center justify-start selection:bg-blue-500 selection:text-white">
      {/* Conteneur Mobile-First (centré max 672px sur desktop) */}
      <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col relative pb-8">
        
        {/* EN-TÊTE SUPÉRIEUR SOBRE & ÉLÉGANT (Style Stripe/PayPal Fintech) */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white pt-safe pb-14 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg text-center overflow-hidden">
          {/* Lueur subtile signature Tivo */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Barre haute : Statut réseau / Retour Landing + Switch Thème */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            {/* Statut En ligne ou bouton retour présentation */}
            <div className="flex items-center gap-2">
              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Présentation & Tarifs</span>
                </button>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'fr' ? 'En ligne' : 'Online'}</span>
              </div>
            </div>

            {/* Bouton bascule de thème */}
            <button
              onClick={toggleTheme}
              aria-label="Changer de thème"
              className="p-2 rounded-full glass-pill hover:bg-white/15 active:scale-95 transition-all text-white"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Logo officiel Tivo & Titre */}
          <div className="relative z-10 flex flex-col items-center justify-center mt-1">
            <div className="relative mb-2.5">
              <img
                src="/logo-tivo.png"
                alt="Logo Tivo"
                className="w-14 h-14 rounded-2xl object-contain shadow-lg ring-2 ring-white/20"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Tivo
            </h1>
            <p className="text-xs text-blue-100/90 font-normal tracking-wide mt-0.5">
              {language === 'fr' ? 'Plateforme de Gestion Mobile Money' : 'Mobile Money Management Platform'}
            </p>
          </div>
        </header>

        {/* CARTE FLOTTANTE D'AUTHENTIFICATION */}
        <main className="relative z-20 -mt-6 px-4 sm:px-6 w-full flex-1 flex flex-col">
          <div className="bg-white dark:bg-[#0A101D] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 sm:p-7 shadow-sm flex flex-col">
            
            {/* ONGLETS CONNEXION / INSCRIPTION (Segmented Control Stripe-like) */}
            <div className="bg-slate-100 dark:bg-[#070D18] p-1 rounded-xl flex items-center mb-5 border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#101A2E] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-blue-900/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Connexion' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-[#101A2E] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-blue-900/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Inscription' : 'Sign Up'}
              </button>
            </div>

            {/* MESSAGES D'ALERTE */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* SÉLECTEUR DE RÔLE : GÉRANT OU ADMINISTRATEUR */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {activeTab === 'login'
                    ? (language === 'fr' ? 'Se connecter en tant que :' : 'Sign in as:')
                    : (language === 'fr' ? 'Créer un compte en tant que :' : 'Sign up as:')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Profil utilisateur' : 'User profile'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* PANNEAU 1 : GÉRANT */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('gerant')}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between relative cursor-pointer active:scale-[0.99] ${
                    selectedRole === 'gerant'
                      ? 'border-blue-600 dark:border-blue-500 bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white dark:from-[#0C1E3C] dark:to-[#071324] ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09101C] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'gerant'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Store className="w-4 h-4" />
                    </div>
                    {selectedRole === 'gerant' ? (
                      <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-blue-600 text-white shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Gérant
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        selectedRole === 'gerant'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        Point de Vente
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {language === 'fr' 
                        ? 'Caisse, transactions & commissions' 
                        : 'Cashier, MM transactions & commissions'}
                    </p>
                  </div>
                </button>

                {/* PANNEAU 2 : ADMINISTRATEUR */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between relative cursor-pointer active:scale-[0.99] ${
                    selectedRole === 'admin'
                      ? 'border-indigo-600 dark:border-indigo-500 bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white dark:from-[#13193D] dark:to-[#071324] ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09101C] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedRole === 'admin'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {selectedRole === 'admin' ? (
                      <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Administrateur
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        selectedRole === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        Supervision
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {language === 'fr' 
                        ? 'Audit, clôtures & gestion d’équipe' 
                        : 'Audit, closures & multi-agencies'}
                    </p>
                  </div>
                </button>
              </div>

              {/* RASSURANCE ET EXPLICATION CONTEXTUELLE DU RÔLE CHOISI (Parfaitement lisible en mode clair et sombre) */}
              <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-xs border flex items-center gap-2.5 transition-all duration-200 ${
                selectedRole === 'admin'
                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 dark:bg-[#0F1836] dark:border-indigo-900/60 dark:text-indigo-200'
                  : 'bg-blue-50/90 border-blue-200 text-blue-950 dark:bg-[#0B1A36] dark:border-blue-900/60 dark:text-blue-200'
              }`}>
                {selectedRole === 'admin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span className="leading-snug font-medium">
                      {activeTab === 'login'
                        ? (language === 'fr' 
                            ? 'Mode Administrateur : console de supervision, audit et clôtures consolidées.' 
                            : 'Admin Mode: supervision console, audit trail and global closures.')
                        : (language === 'fr'
                            ? 'Compte Administrateur : gestion des points de vente, des caissiers et de l’audit.'
                            : 'Admin Account: oversee kiosks, cashiers and audit trail.')}
                    </span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="leading-snug font-medium">
                      {activeTab === 'login'
                        ? (language === 'fr'
                            ? 'Mode Gérant : terminal de caisse, soldes de réseaux et enregistrement des flux.'
                            : 'Manager Mode: POS terminal, network balances, and cash transactions.')
                        : (language === 'fr'
                            ? 'Compte Gérant : gestion quotidienne de votre point de vente Mobile Money.'
                            : 'Manager Account: daily management of your MM agency and cash.')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* FORMULAIRE CONNEXION */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <TivoField
                  label={language === 'fr' ? 'Adresse email' : 'Email address'}
                  type="email"
                  placeholder={selectedRole === 'admin' ? 'admin@tivo.bj' : 'gerant@tivo.bj'}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <div className="flex flex-col gap-1">
                  <TivoField
                    label={language === 'fr' ? 'Mot de passe' : 'Password'}
                    isPassword
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    required
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => alert("Fonctionnalité de réinitialisation par email/SMS à venir.")}
                      className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline transition-colors"
                    >
                      {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                    </button>
                  </div>
                </div>

                <TivoButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  className="mt-2.5 !h-12 !rounded-xl !bg-gradient-to-r !from-blue-600 !via-blue-700 !to-indigo-600 hover:!from-blue-500 hover:!via-blue-600 hover:!to-indigo-500 !text-white !font-semibold !shadow-md !shadow-blue-600/25 active:scale-[0.99] border border-blue-400/20 transition-all duration-200"
                >
                  {selectedRole === 'admin'
                    ? (language === 'fr' ? 'Se connecter comme Administrateur' : 'Sign In as Administrator')
                    : (language === 'fr' ? 'Se connecter comme Gérant' : 'Sign In as Manager')}
                </TivoButton>
              </form>
            ) : (
              /* FORMULAIRE INSCRIPTION */
              <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
                <TivoField
                  label={
                    selectedRole === 'admin'
                      ? (language === 'fr' ? 'Nom du Superviseur / Admin' : 'Admin / Supervisor Name')
                      : (language === 'fr' ? 'Nom complet du Gérant' : 'Manager Full Name')
                  }
                  placeholder={selectedRole === 'admin' ? 'Ex: Koffi SOULE' : 'Ex: Nazirou GBADAMASSI'}
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  required
                />

                <TivoField
                  label={language === 'fr' ? 'Adresse email' : 'Email address'}
                  type="email"
                  placeholder={selectedRole === 'admin' ? 'admin@tivo.bj' : 'gerant@tivo.bj'}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                />

                <TivoField
                  label={language === 'fr' ? 'Mot de passe' : 'Password'}
                  isPassword
                  placeholder="Minimum 6 caractères"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />

                <TivoField
                  label={language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                  isPassword
                  placeholder="Retapez le mot de passe"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                  error={
                    signupConfirmPassword && signupPassword !== signupConfirmPassword
                      ? (language === 'fr' ? 'Les mots de passe ne concordent pas' : 'Passwords do not match')
                      : undefined
                  }
                />

                <div className="flex items-start gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    defaultChecked
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {language === 'fr'
                      ? "J'accepte les conditions d'utilisation et la politique de confidentialité Tivo."
                      : 'I accept Tivo terms of service and privacy policy.'}
                  </label>
                </div>

                <TivoButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  className="mt-2.5 !h-12 !rounded-xl !bg-gradient-to-r !from-blue-600 !via-blue-700 !to-indigo-600 hover:!from-blue-500 hover:!via-blue-600 hover:!to-indigo-500 !text-white !font-semibold !shadow-md !shadow-blue-600/25 active:scale-[0.99] border border-blue-400/20 transition-all duration-200"
                >
                  {selectedRole === 'admin'
                    ? (language === 'fr' ? 'Créer mon compte Administrateur' : 'Create Administrator Account')
                    : (language === 'fr' ? 'Créer mon compte Gérant' : 'Create Manager Account')}
                </TivoButton>
              </form>
            )}

            {/* SÉPARATEUR & CONNEXION RAPIDE DÉMO */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'fr' ? 'Accès Démo Rapide' : 'Quick Demo Access'}
                </span>
                <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* BOUTONS DÉMO AVEC COULEURS ET CONTRASTE PARFAITEMENT ADAPTÉS */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('caissier')}
                  className="p-2 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0D1627] dark:hover:bg-[#122038] text-slate-800 dark:text-slate-100 text-xs font-semibold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-[0.98] shadow-xs min-w-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] sm:text-[11.5px] leading-tight text-center font-semibold text-slate-800 dark:text-white truncate w-full">Caissier</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('gerant')}
                  className="p-2 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0D1627] dark:hover:bg-[#122038] text-slate-800 dark:text-slate-100 text-xs font-semibold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-[0.98] shadow-xs min-w-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] sm:text-[11.5px] leading-tight text-center font-semibold text-slate-800 dark:text-white truncate w-full">Gérant</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0D1627] dark:hover:bg-[#122038] text-slate-800 dark:text-slate-100 text-xs font-semibold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-[0.98] shadow-xs min-w-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] sm:text-[11.5px] leading-tight text-center font-semibold text-slate-800 dark:text-white truncate w-full">Admin</span>
                </button>
              </div>
            </div>

          </div>

          {/* SÉLECTEUR DE LANGUE */}
          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-full shadow-xs border border-slate-300/40 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  language === 'fr'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* PRIX / RASSURANCE FINTECH */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-5">
            Tivo v1.0 • Chiffrement sécurisé des opérations Mobile Money
          </p>

        </main>
      </div>
    </div>
  );
};
