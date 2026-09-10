import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronDown, 
  Coins, 
  FileText, 
  Camera, 
  WifiOff, 
  Star, 
  Check, 
  X,
  Menu,
  Wallet,
  MessageCircle,
  Mail
} from 'lucide-react';
import { useAuth, SubscriptionPlan } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PricingSection } from './components/PricingSection';
import { AuthModal } from './components/AuthModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { ScrollReveal } from './components/ScrollReveal';
import { GsapTilt, GsapMagnetic, GsapPulseBadge, GsapScannerLine } from './components/GsapEffects';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnterApp,
  onOpenAuth 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, quickDemoLogin } = useAuth();

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan>('pro');
  const [billingCycleForModal, setBillingCycleForModal] = useState<'monthly' | 'annual'>('annual');

  // Legal modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocType>('cgu');

  const handleOpenLegal = (doc: LegalDocType) => {
    setSelectedLegalDoc(doc);
    setIsLegalModalOpen(true);
  };

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Trigger Auth Modal with a selected plan
  const handleSelectPlan = (plan: SubscriptionPlan, cycle: 'monthly' | 'annual') => {
    setSelectedPlanForModal(plan);
    setBillingCycleForModal(cycle);
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    if (onOpenAuth) {
      onOpenAuth('login');
    } else {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setSelectedPlanForModal('pro');
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleQuickDemoClick = (role: 'gerant' | 'admin' | 'caissier' = 'gerant') => {
    quickDemoLogin(role, 'pro');
    onEnterApp();
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ Data
  const faqs = [
    {
      q: "Est-ce que TIVO fonctionne sans connexion Internet ?",
      a: "Oui, à 100% ! TIVO a été conçu en mode 'Offline-First' pour répondre aux coupures de réseau. Vous pouvez enregistrer des dépôts, des retraits, compter votre caisse et clôturer votre journée même sans connexion. Dès que l'accès revient, vos données sont synchronisées automatiquement et en toute sécurité."
    },
    {
      q: "Puis-je installer TIVO sur mon smartphone (Android ou iPhone) ?",
      a: "Absolument. TIVO est une Progressive Web App (PWA) ultra-légère. Vous pouvez l'installer en 1 clic directement sur l'écran d'accueil de votre téléphone Android ou iPhone depuis votre navigateur Chrome ou Safari, sans passer par un store d'applications."
    },
    {
      q: "Comment fonctionne la reconnaissance photo (OCR) des SMS de transaction ?",
      a: "Dans l'application, vous pouvez prendre en photo l'écran du téléphone du client ou coller le SMS de l'opérateur. TIVO extrait instantanément le montant, le numéro de téléphone et le réseau (MTN MoMo, Moov Money, Celtis Cash) pour vous éviter les fautes de frappe."
    },
    {
      q: "Comment s'effectue le règlement des abonnements ?",
      a: "Vous pouvez régler directement avec vos comptes Mobile Money habituels (MTN Mobile Money, Moov Money, Celtis Cash, Wave) ou par carte bancaire. Vous bénéficiez d'une période d'essai de 7 jours pour tester le plan Pro sans aucun engagement."
    },
    {
      q: "Puis-je gérer plusieurs kiosques avec un seul compte ?",
      a: "Oui ! Le plan MAX / Business est spécialement conçu pour les propriétaires de plusieurs kiosques et flottes. Vous pouvez ajouter autant de points de vente et de caissiers que vous souhaitez, et surveiller l'ensemble des caisses en direct depuis votre tableau de bord superviseur."
    },
    {
      q: "Mes données financières sont-elles confidentielles et protégées ?",
      a: "Vos données financières vous appartiennent exclusivement. Elles sont chiffrées selon les standards bancaires les plus stricts. De plus, un mode discrétion (icône œil) vous permet de masquer tous les montants à l'écran en un clic devant les clients."
    }
  ];

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#070D1B] dark:text-slate-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white relative font-sans">
      
      {/* MODALE D'AUTHENTIFICATION & D'ABONNEMENT */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialPlan={selectedPlanForModal}
        initialBillingCycle={billingCycleForModal}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          onEnterApp();
        }}
      />

      {/* MODALE LÉGALE & CONFORMITÉ UEMOA */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialDoc={selectedLegalDoc}
      />

      {/* ========================================================
          1. HEADER FLOTTANT EN FORME DE PILL (STICKY / FIXED)
         ======================================================== */}
      <header className={`fixed top-3 sm:top-4 left-0 right-0 ${isAuthModalOpen || isLegalModalOpen ? 'z-30 opacity-0 pointer-events-none' : 'z-50'} px-3 sm:px-6 pointer-events-none transition-all duration-200`}>
        <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-[#0A1224]/75 backdrop-blur-xl backdrop-saturate-150 border border-slate-200/70 dark:border-blue-800/40 shadow-lg shadow-slate-900/5 dark:shadow-black/40 px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto transition-all">
          
          {/* Logo officiel & Marque (Épuré : Logo + TIVO uniquement, bien espacé) */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0 mr-4 lg:mr-7 xl:mr-9" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="/logo-tivo.png" 
              alt="Logo TIVO" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs hover:scale-105 transition-transform"
            />
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              TIVO
            </span>
          </div>

          {/* Liens de navigation (Desktop - Espacement bien proportionné & police élégante text-xs) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('avant-apres')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Pourquoi TIVO ?
            </button>
            <button 
              onClick={() => scrollToSection('tarifs')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tarifs & Abonnements</span>
            </button>
            <button 
              onClick={() => scrollToSection('avis')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Avis Gérants
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              FAQ
            </button>
          </nav>

          {/* Actions & Boutons (Taille maîtrisée, police compacte) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto lg:ml-0">
            {isAuthenticated ? (
              <button
                onClick={onEnterApp}
                className="py-1.5 px-3.5 sm:px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Mon Kiosque</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                {/* Bouton Connexion */}
                <button
                  onClick={handleOpenLogin}
                  className="hidden md:inline-flex py-1.5 px-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Se connecter
                </button>

                {/* Bouton Démo Rapide */}
                <button
                  onClick={() => handleQuickDemoClick('gerant')}
                  className="hidden sm:inline-flex py-1.5 px-3 rounded-full bg-blue-50/80 dark:bg-[#111C33] hover:bg-blue-100 dark:hover:bg-[#162544] text-blue-700 dark:text-blue-300 font-bold text-[11px] sm:text-xs border border-blue-200/70 dark:border-blue-800/40 transition-all cursor-pointer items-center gap-1 shadow-xs"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Démo 1-clic</span>
                </button>

                {/* Bouton Inscription / Créer un compte */}
                <button
                  onClick={handleOpenSignup}
                  className="py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer border border-blue-400/20"
                >
                  <span>Créer un compte</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Hamburger Menu Toggle (Mobile) */}
                <button
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  aria-label="Menu mobile"
                  className="lg:hidden p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>

        </div>

        {/* MENU MOBILE DÉROULANT SOUS LA PILL */}
        {mobileMenuOpen && (
          <div className="max-w-md mx-auto mt-2 p-4 rounded-3xl bg-white/80 dark:bg-[#0C1527]/85 backdrop-blur-xl border border-slate-200/80 dark:border-blue-900/40 shadow-2xl pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-2.5 text-xs font-semibold">
            <button 
              onClick={() => scrollToSection('features')}
              className="py-2 px-3 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('avant-apres')}
              className="py-2 px-3 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Pourquoi TIVO ?
            </button>
            <button 
              onClick={() => scrollToSection('tarifs')}
              className="py-2 px-3 rounded-xl text-left text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-between"
            >
              <span>Tarifs & Abonnements</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => scrollToSection('avis')}
              className="py-2 px-3 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Avis Gérants
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="py-2 px-3 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              FAQ
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenLogin}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
              >
                Se connecter
              </button>
              <button
                onClick={() => handleQuickDemoClick('gerant')}
                className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-center border border-blue-200 dark:border-blue-900/40"
              >
                Démo 1-clic
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION (DÉGRADÉ SIGNATURE TIVO & ÉLÉMENTS ÉCARTÉS)
         ======================================================== */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-100/90 via-blue-50/50 to-white dark:from-[#0B1A3A] dark:via-[#081125] dark:to-[#070D1B]">
        {/* Halo lumineux signature TIVO Fintech (Bleu Royal / Indigo lumineux sans effet néon) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[750px] sm:w-[950px] h-[450px] sm:h-[550px] bg-gradient-to-br from-blue-400/25 via-indigo-400/20 to-sky-300/25 dark:from-blue-600/25 dark:via-indigo-600/15 dark:to-transparent rounded-full blur-[110px] pointer-events-none z-0" />

        {/* Dégradé ascendant signature TIVO reliant harmonieusement le bas de la Hero section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 bg-gradient-to-t from-blue-200/60 via-blue-100/30 to-transparent dark:from-[#070D1B] dark:via-transparent pointer-events-none z-0" />

        {/* Dégradé supérieur signature de l'application sous la navbar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
          
          {/* GAUCHE : COPYWRITING */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0">
            {/* Tag Badge */}
            <ScrollReveal animation="fade-down" delay={80}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Conçu pour MTN MoMo • Moov Money • Celtis Cash</span>
              </div>
            </ScrollReveal>

            {/* Titre Principal */}
            <ScrollReveal animation="fade-up" delay={180}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                La caisse sans stress pour votre{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
                  Kiosque Mobile Money
                </span>
              </h1>
            </ScrollReveal>

            {/* Sous-titre */}
            <ScrollReveal animation="fade-up" delay={280}>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Fini les écarts de caisse inexpliqués, les calculs manuels fatiguants et les cahiers froissés. 
                Pilotez tous vos soldes, comptez vos billets et fermez votre journée en 1 clic — <strong className="text-slate-900 dark:text-white">même sans Internet</strong>.
              </p>
            </ScrollReveal>

            {/* CTAs (Harmonisés avec le design des boutons de la grille tarifaire : rounded-xl, taille compacte) */}
            <ScrollReveal animation="fade-up" delay={380}>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('tarifs')}
                  className="w-full sm:w-auto py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Commencer Gratuitement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoClick('gerant')}
                  className="w-full sm:w-auto py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl bg-white dark:bg-[#0E172C] hover:bg-slate-50 dark:hover:bg-[#121F3A] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tester la Démo en 1 clic</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Rassurance Puces */}
            <ScrollReveal animation="fade-up" delay={480}>
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Hors-Ligne</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zéro carte bancaire requise</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Format UEMOA (FCFA)</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* DROITE : APERÇU INTERACTIF DE L'INTERFACE TIVO AVEC ÉLÉMENTS FLOTTANTS ÉCARTÉS ET ANIMÉS */}
          <ScrollReveal animation="fade-left" delay={250} className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center relative py-12 sm:py-16 px-4 sm:px-14 lg:px-20">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
              
              {/* ÉLÉMENT FLOTTANT 1 (HAUT GAUCHE) : VRAI DÉPÔT MTN MOMO (AU PREMIER PLAN - z-20) */}
              <div className="tivo-floating-badge-1 absolute -top-10 sm:-top-12 lg:-top-14 -left-4 sm:-left-16 lg:-left-24 z-20 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-[#0C162A]/95 backdrop-blur-md border border-slate-200/90 dark:border-blue-800/60 shadow-xl shadow-slate-900/10 dark:shadow-black/60 pointer-events-none sm:pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFCC00] text-black font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs shrink-0">
                    MoMo
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                        +75 000 FCFA
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      Dépôt client validé
                    </span>
                  </div>
                </div>
              </div>

              {/* ÉLÉMENT FLOTTANT 2 (HAUT DROITE) : PORTEFEUILLE FLOTTE UV (À L'ARRIÈRE-PLAN DU SMARTPHONE - z-0) */}
              <div className="tivo-floating-badge-2 absolute -top-8 sm:-top-10 lg:-top-12 -right-4 sm:-right-16 lg:-right-24 z-0 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-[#0C162A]/90 backdrop-blur-sm border border-slate-200/80 dark:border-blue-800/50 shadow-lg shadow-blue-600/10 dark:shadow-black/50 pointer-events-none sm:pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-blue-300 font-medium block">
                      Portefeuille Flotte UV
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      950 000 FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* ÉLÉMENT FLOTTANT 3 (BAS DROITE) : CONTRÔLE DE CAISSE & ZÉRO ÉCART (AU PREMIER PLAN - z-20) */}
              <div className="tivo-floating-badge-3 absolute -bottom-10 sm:-bottom-12 lg:-bottom-14 -right-4 sm:-right-14 lg:-right-20 z-20 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-[#0C162A]/95 backdrop-blur-md border border-slate-200/90 dark:border-blue-800/60 shadow-xl shadow-emerald-600/10 dark:shadow-black/60 pointer-events-none sm:pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                      Écart : 0 FCFA
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      Caisse carrée & scellée
                    </div>
                  </div>
                </div>
              </div>

              {/* ÉLÉMENT FLOTTANT 4 (BAS GAUCHE) : MOOV MONEY (À L'ARRIÈRE-PLAN DU SMARTPHONE - z-0) */}
              <div className="tivo-floating-badge-4 absolute -bottom-8 sm:-bottom-10 lg:-bottom-12 -left-4 sm:-left-14 lg:-left-20 z-0 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0C162A]/90 backdrop-blur-sm border border-slate-200/80 dark:border-blue-800/50 shadow-lg pointer-events-none sm:pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#005CA9] text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                    Moov
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">
                      Retrait 25 000 F
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      SMS OCR capté
                    </span>
                  </div>
                </div>
              </div>

              {/* MOCKUP DU SMARTPHONE (AU PLAN INTERMÉDIAIRE - z-10) AVEC EFFET 3D GSAP AU SURVOL */}
              <GsapTilt maxTilt={5} className="relative z-10 w-full">
                <div className="w-full rounded-[2.5rem] bg-white dark:bg-[#0A101D] border-4 border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-slate-900 dark:text-slate-100 overflow-hidden">
                  
                  {/* Notch Smartphone */}
                  <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-900" />
                  </div>

                  {/* Carte Solde Global TIVO */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-sm">
                    <div className="flex items-center justify-between text-[11px] text-blue-100">
                      <span>Trésorerie Kiosque Réunie</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-[10px]">
                        ● En direct
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1 tracking-tight">
                      1 450 000 FCFA
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/20 grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div className="p-1.5 rounded-lg bg-black/20 text-white">
                        <span className="text-blue-100 block">Téléphones (UV)</span>
                        <span className="font-bold text-white">950 000 FCFA</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/20 text-white">
                        <span className="text-blue-100 block">Caisse (Espèces)</span>
                        <span className="font-bold text-white">500 000 FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Opérateurs Réseaux */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block">MTN MoMo</span>
                      <span className="font-semibold text-slate-800 dark:text-white mt-0.5 block">500 000 F</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                      <span className="font-bold text-blue-700 dark:text-blue-400 block">Moov</span>
                      <span className="font-semibold text-slate-800 dark:text-white mt-0.5 block">300 000 F</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Celtis</span>
                      <span className="font-semibold text-slate-800 dark:text-white mt-0.5 block">150 000 F</span>
                    </div>
                  </div>

                  {/* Résultat Décompte / Billetage */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0E172C] border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Contrôle de Caisse TIVO</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Écart : 0 FCFA</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Billets de 10 000, 5 000 et pièces comptés avec succès. Votre caisse est parfaitement équilibrée.
                    </p>
                  </div>

                  {/* Bouton simulation */}
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('gerant')}
                    className="mt-3 w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ouvrir l'application en direct</span>
                  </button>

                </div>
              </GsapTilt>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================
          3. SECTION FONCTIONNALITÉS CLÉS (ESPACEMENT ÉQUILIBRÉ & FOND BLEUTÉ DOUX)
         ======================================================== */}
      <section id="features" className="py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 border-t border-blue-100/70 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-[#091326] dark:via-[#070D1B] dark:to-[#070D1B]">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal animation="fade-up" className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conçu pour le terrain</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tout ce dont vous avez besoin pour sécuriser chaque franc
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Des fonctionnalités pensées avec et pour les gérants de points Mobile Money d'Afrique de l'Ouest.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Feature 1 : Billetage & Zéro écart de caisse */}
            <ScrollReveal animation="fade-up" delay={50} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance bleutée douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-200/40 via-sky-100/25 to-transparent dark:from-blue-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100/90 dark:bg-blue-950/90 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs ring-1 ring-blue-500/20 backdrop-blur-md">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Billetage & Zéro écart de caisse
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    Comptez facilement vos coupures (10 000, 5 000, 2 000, 1 000, 500) et pièces. TIVO calcule immédiatement l'écart : manquant ou surplus sans erreur possible.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#0E1A33]/90 backdrop-blur-xl border border-slate-200/90 dark:border-blue-700/40 shadow-xl shadow-blue-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/80 dark:border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Billetage FCFA</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/60">
                        Caisse UEMOA
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-1.5 rounded-xl bg-violet-50/90 dark:bg-violet-950/50 border border-violet-200/80 dark:border-violet-900/50 shadow-xs">
                        <span className="text-violet-700 dark:text-violet-300 font-black block">10 000 F</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-[9px]">x 25</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs">
                        <span className="text-emerald-700 dark:text-emerald-300 font-black block">5 000 F</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-[9px]">x 14</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-900/50 shadow-xs">
                        <span className="text-sky-700 dark:text-sky-300 font-black block">2 000 F</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-[9px]">x 20</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>360 000 F</span>
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        Écart : 0 F ✓
                      </span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

            {/* Feature 2 : Scan Photo & Reconnaissance OCR */}
            <ScrollReveal animation="fade-up" delay={150} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance émeraude douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-emerald-200/40 via-teal-100/25 to-transparent dark:from-emerald-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs ring-1 ring-emerald-500/20 backdrop-blur-md">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Scan Photo & Reconnaissance OCR
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    Photographiez l'écran du téléphone du client ou collez le SMS de notification. TIVO extrait automatiquement le montant et le numéro pour vous.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#081922]/90 backdrop-blur-xl border border-slate-200/90 dark:border-emerald-700/40 shadow-xl shadow-emerald-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left">
                    <div className="relative p-2 rounded-xl bg-slate-900 text-white font-mono text-[9px] overflow-hidden border border-emerald-500/50 shadow-inner">
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                      {/* Faisceau laser animé GSAP */}
                      <GsapScannerLine className="inset-x-2" />
                      <p className="text-slate-200 truncate pl-1">
                        "MoMo: Reçu <strong className="text-emerald-400 font-bold">50.000 F</strong> de <span className="text-sky-300 font-bold">97 00 11 22</span>"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="p-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50">
                        <span className="text-slate-500 dark:text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Montant extrait</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300 text-[11px]">50 000 FCFA</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50">
                        <span className="text-slate-500 dark:text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Numéro Client</span>
                        <span className="font-black text-blue-700 dark:text-blue-300 text-[11px]">+229 97 00</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold justify-center pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OCR Automatique Détecté (0,3 s)</span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

            {/* Feature 3 : Multi-Opérateurs Réunis */}
            <ScrollReveal animation="fade-up" delay={250} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance indigo douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-indigo-200/40 via-blue-100/25 to-transparent dark:from-indigo-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100/90 dark:bg-indigo-950/90 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs ring-1 ring-indigo-500/20 backdrop-blur-md">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Multi-Opérateurs Réunis
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    Regroupez MTN MoMo, Moov Money, Celtis Cash et Wave sur un écran unique. Surveillez vos stocks d'unités (UV) et rechargez au bon moment.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#0E1528]/90 backdrop-blur-xl border border-slate-200/90 dark:border-indigo-700/40 shadow-xl shadow-indigo-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left">
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-1.5 rounded-xl bg-[#FFCC00]/20 dark:bg-[#FFCC00]/15 border border-[#FFCC00]/60 shadow-xs">
                        <div className="w-4 h-4 rounded-md bg-[#FFCC00] text-black font-black text-[8px] flex items-center justify-center mx-auto mb-1 shadow-xs">
                          M
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300 block">MTN</span>
                        <span className="font-black text-slate-900 dark:text-white block text-[10px]">500k F</span>
                      </div>

                      <div className="p-1.5 rounded-xl bg-[#005CA9]/15 dark:bg-[#005CA9]/15 border border-[#005CA9]/50 shadow-xs">
                        <div className="w-4 h-4 rounded-md bg-[#005CA9] text-white font-black text-[8px] flex items-center justify-center mx-auto mb-1 shadow-xs">
                          M
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300 block">Moov</span>
                        <span className="font-black text-slate-900 dark:text-white block text-[10px]">350k F</span>
                      </div>

                      <div className="p-1.5 rounded-xl bg-[#009639]/15 dark:bg-[#009639]/15 border border-[#009639]/50 shadow-xs">
                        <div className="w-4 h-4 rounded-md bg-[#009639] text-white font-black text-[8px] flex items-center justify-center mx-auto mb-1 shadow-xs">
                          C
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300 block">Celtis</span>
                        <span className="font-black text-slate-900 dark:text-white block text-[10px]">200k F</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-indigo-200 font-bold flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Flotte Totale</span>
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-300 text-[11px]">1 050 000 F</span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

            {/* Feature 4 : 100% Autonome Hors-Ligne */}
            <ScrollReveal animation="fade-up" delay={100} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance ambrée douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-amber-200/40 via-orange-100/25 to-transparent dark:from-amber-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100/90 dark:bg-amber-950/90 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs ring-1 ring-amber-500/20 backdrop-blur-md">
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    100% Autonome Hors-Ligne
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    Une coupure de connexion ? TIVO continue de tourner sans ralentissement. Toutes vos transactions sont enregistrées localement et synchronisées plus tard.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#1E150A]/90 backdrop-blur-xl border border-slate-200/90 dark:border-amber-700/40 shadow-xl shadow-amber-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-black text-amber-900 dark:text-amber-200">Mode Hors-Ligne</span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                        Actif
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span>File d'attente locale</span>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-[11px]">14 ventes</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full w-full" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>IndexedDB & Synchro automatique</span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

            {/* Feature 5 : Carnet d'avances & Dettes clients */}
            <ScrollReveal animation="fade-up" delay={200} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance rose douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-rose-200/40 via-pink-100/25 to-transparent dark:from-rose-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100/90 dark:bg-rose-950/90 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs ring-1 ring-rose-500/20 backdrop-blur-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Carnet d'avances & Dettes clients
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    Gardez un œil sur l'argent dehors. Enregistrez les petits crédits accordés aux clients réguliers et notez les remboursements en temps réel.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#1E0C15]/90 backdrop-blur-xl border border-slate-200/90 dark:border-rose-700/40 shadow-xl shadow-rose-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left">
                    <div className="p-1.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[8px] shadow-xs">
                          MC
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">Maman Chantal</span>
                      </div>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-[11px]">15 000 F</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[8px] shadow-xs">
                          KA
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white">Koffi Artisan</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-[11px]">0 F (Réglé ✓)</span>
                    </div>

                    <div className="text-[10px] text-center text-slate-600 dark:text-slate-300 font-bold pt-0.5">
                      Total carnet dehors : <span className="text-rose-600 dark:text-rose-400 font-black">25 000 FCFA</span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

            {/* Feature 6 : Clôture Journalière Scellée & PDF */}
            <ScrollReveal animation="fade-up" delay={300} className="h-full">
              <GsapTilt maxTilt={5} className="group relative rounded-3xl bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-900/40 p-6 sm:p-7 overflow-hidden shadow-xs hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-500/40 transition-all duration-300 min-h-[320px] sm:min-h-[340px] flex flex-col justify-between h-full">
                {/* Lueur d'ambiance ciel douce */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-sky-200/40 via-blue-100/25 to-transparent dark:from-sky-600/20 dark:to-transparent rounded-full blur-2xl pointer-events-none z-0" />

                {/* Contenu Texte au Premier Plan (z-10) */}
                <div className="relative z-10 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100/90 dark:bg-sky-950/90 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs ring-1 ring-sky-500/20 backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Clôture Journalière Scellée & PDF
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-[92%]">
                    À la fermeture, scellez la journée avec signature et téléchargez le bilan propre en PDF ou ticket thermique pour votre patron ou pour vos archives.
                  </p>
                </div>

                {/* Illustration UI en Arrière-Plan avec Effet Glassmorphism Bien Visible (z-0) */}
                <div className="absolute -right-2 -bottom-2 w-[82%] sm:w-[75%] max-w-[285px] pointer-events-none select-none z-0 rotate-[-2deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#081525]/90 backdrop-blur-xl border border-slate-200/90 dark:border-sky-700/40 shadow-xl shadow-sky-950/10 dark:shadow-black/50 opacity-85 sm:opacity-80 dark:opacity-75 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 space-y-2 text-left font-mono text-[10px]">
                    <div className="p-2 rounded-xl bg-slate-900 text-white border border-sky-500/40 space-y-1 shadow-inner">
                      <div className="flex items-center justify-between text-sky-300 text-[9px] border-b border-white/10 pb-1 font-sans">
                        <span className="font-bold">BILAN DU JOUR</span>
                        <span className="font-black text-emerald-400">21:30 ✓ Scellé</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Flux total :</span>
                        <span className="font-extrabold text-white">2 850 000 F</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Commissions :</span>
                        <span className="font-black text-emerald-400">+34 200 F</span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between text-[10px] font-sans">
                      <span className="font-extrabold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Code PIN validé</span>
                      </span>
                      <span className="font-black text-blue-600 dark:text-blue-400">PDF & Ticket ✓</span>
                    </div>
                  </div>
                </div>
              </GsapTilt>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. COMPARATIF AVANT / APRÈS TIVO (FOND TEINTÉ BLEU)
         ======================================================== */}
      <section id="avant-apres" className="py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-blue-900/30 bg-gradient-to-b from-white via-blue-50/25 to-blue-50/40 dark:from-[#070D1B] dark:via-[#081124] dark:to-[#081124]">
        <div className="max-w-5xl mx-auto">
          
          <ScrollReveal animation="fade-up" className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pourquoi remplacer votre cahier papier par TIVO ?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              La différence entre perdre du temps et de l'argent chaque soir, ou fermer son kiosque en 2 minutes le cœur tranquille.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* AVANT TIVO - glisse depuis la gauche */}
            <ScrollReveal animation="fade-right" delay={100} className="h-full">
              <GsapTilt maxTilt={4} className="p-6 sm:p-7 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs space-y-3 shadow-xs h-full">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 text-sm">
                  <X className="w-5 h-5 text-rose-600 stroke-[3]" />
                  <span>Sans TIVO (Cahier & Calculatrice)</span>
                </div>
                <ul className="space-y-2.5 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>Calculs compliqués à 20h quand la fatigue s'installe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>Écarts d'argent fréquents sans savoir d'où vient l'erreur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>Cahier papier froissé, taché ou perdu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>Dettes oubliées et argent perdu chez les clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>Disputes et soupçons entre le gérant et le propriétaire</span>
                  </li>
                </ul>
              </GsapTilt>
            </ScrollReveal>

            {/* AVEC TIVO - glisse depuis la droite */}
            <ScrollReveal animation="fade-left" delay={200} className="h-full">
              <GsapTilt maxTilt={4} className="p-6 sm:p-7 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-3 shadow-xs h-full">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                  <span>Avec TIVO (Rigueur & Sérénité)</span>
                </div>
                <ul className="space-y-2.5 text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>Billetage guidé : vous tapez vos billets, TIVO compte le reste</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>Notification immédiate d'écart : 0 FCFA d'erreur</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>Données sécurisées et archivées à vie dans votre poche</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>Carnet d'avances précis avec relances WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>Bilan officiel PDF avec signature remis au propriétaire</span>
                  </li>
                </ul>
              </GsapTilt>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* ========================================================
          5. SECTION TARIFS (PRICING SECTION)
         ======================================================== */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* ========================================================
          6. TÉMOIGNAGES DE GÉRANTS DE KIOSQUES (FOND BLEU NUIT / DÉGRADÉ SOYEUX)
         ======================================================== */}
      <section id="avis" className="py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 border-t border-blue-100/80 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/50 via-slate-50/50 to-white dark:from-[#09142A] dark:via-[#070E1E] dark:to-[#070D1B]">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal animation="fade-up" className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <GsapPulseBadge scaleAmount={1.03} duration={1.6} className="inline-flex items-center justify-center gap-2 text-amber-500 text-xs font-bold mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              </div>
              <span className="text-slate-700 dark:text-slate-300">Recommandé par les gérants</span>
            </GsapPulseBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ils ont transformé la gestion de leur caisse
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Avis 1 */}
            <ScrollReveal animation="fade-up" delay={100} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-xs">
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                « Avant TIVO, je perdais parfois 5 000 ou 10 000 FCFA dans la semaine à cause d'erreurs de calculs dans mon cahier. Maintenant le soir à la fermeture, je compte mes coupures et en 2 minutes c'est scellé. C'est le jour et la nuit. »
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 font-bold text-white flex items-center justify-center text-xs shadow-xs">
                  NG
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Nazirou G.</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Gérant Kiosque MoMo • Cotonou (Dantokpa)</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Avis 2 */}
            <ScrollReveal animation="fade-up" delay={200} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-xs">
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                « Le mode hors-ligne m'a sauvé plusieurs fois quand le réseau MTN était coupé au quartier. J'ai pu continuer à enregistrer mes retraits et dépôts tranquillement. L'application est super rapide et simple à comprendre. »
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 font-bold text-white flex items-center justify-center text-xs shadow-xs">
                  FK
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Fabrice K.</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Caissier Point Service • Abidjan (Yopougon)</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Avis 3 */}
            <ScrollReveal animation="fade-up" delay={300} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-xs">
              <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                « J'ai 3 kiosques à Lomé. Avec le plan Business, je supervise les caisses de mes 3 employés en direct depuis ma maison. Les bilans PDF signés chaque soir m'apportent une transparence totale. »
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 font-bold text-white flex items-center justify-center text-xs shadow-xs">
                  KS
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Koffi S.</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Superviseur 3 Kiosques • Lomé</span>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. FAQ ACCORDÉON
         ======================================================== */}
      <section id="faq" className="py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070D1B]">
        <div className="max-w-3xl mx-auto">
          
          <ScrollReveal animation="fade-up" className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Questions Fréquentes
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Toutes les réponses à vos questions sur TIVO et son utilisation au quotidien.
            </p>
          </ScrollReveal>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <ScrollReveal
                  key={idx}
                  animation="fade-up"
                  delay={Math.min(idx * 60, 300)}
                  className="rounded-2xl bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-150 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          8. BANNIÈRE FINALE D'ACTION (CALL TO ACTION)
         ======================================================== */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <ScrollReveal animation="zoom-in" delay={100} className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 p-8 sm:p-14 text-center text-white relative shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Prêt à sécuriser les finances de votre kiosque ?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-normal">
              Rejoignez les gérants qui ont dit adieu aux manquants et aux erreurs de caisse. Commencez gratuitement aujourd'hui.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <GsapMagnetic strength={0.2}>
                <button
                  type="button"
                  onClick={handleOpenSignup}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Créer mon compte maintenant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </GsapMagnetic>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('gerant')}
                className="w-full sm:w-auto py-3.5 px-6 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Démo interactive</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================
          9. FOOTER ULTRA-MODERNE (BLEU NUIT TIVO, CENTRÉ MOBILE & CLASSIC PC)
         ======================================================== */}
      <footer className="relative pt-14 sm:pt-18 pb-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#091533] via-[#070F25] to-[#040918] text-slate-300 border-t border-blue-900/40 overflow-hidden">
        {/* Lueur d'ambiance bleu nuit / indigo supérieure en harmonie avec le Call to Action */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* GRILLE PRINCIPALE : CENTRÉE SUR TÉLÉPHONE (< sm), FORMAT D'ORIGINE SUR PC (sm / lg) */}
          <ScrollReveal animation="fade-up" delay={100} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 sm:pb-16">
            
            {/* COLONNE 1 & 2 : MARQUE & MISSION (SPAN 2 SUR GRAND ÉCRAN) */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4 max-w-sm mx-auto sm:mx-0 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div 
                className="flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer select-none"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img 
                  src="/logo-tivo.png" 
                  alt="Logo TIVO" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
                />
                <span className="text-lg font-black tracking-tight text-white">
                  TIVO
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal text-center sm:text-left">
                La solution de caisse et de gestion tout-en-un pour les kiosques Mobile Money en Afrique de l'Ouest. 
                Une question ? Notre équipe d'assistance est disponible 7j/7 pour vous accompagner.
              </p>

              {/* ICÔNES RÉSEAUX & CONTACT (WHATSAPP ET EMAIL UNIQUEMENT - MAGNÉTIQUES GSAP) */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
                {/* WhatsApp */}
                <GsapMagnetic strength={0.35}>
                  <a
                    href="https://chat.whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Communauté WhatsApp"
                    className="w-9 h-9 rounded-xl bg-blue-950/50 border border-blue-800/60 hover:border-emerald-500/60 hover:bg-emerald-950/40 text-blue-200 hover:text-emerald-400 flex items-center justify-center transition-all shadow-xs"
                    title="Rejoindre notre communauté WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </GsapMagnetic>

                {/* Email */}
                <GsapMagnetic strength={0.35}>
                  <a
                    href="mailto:contact@tivo.bj"
                    aria-label="Contact Email"
                    className="w-9 h-9 rounded-xl bg-blue-950/50 border border-blue-800/60 hover:border-blue-400 hover:bg-blue-900/40 text-blue-200 hover:text-white flex items-center justify-center transition-all shadow-xs"
                    title="Écrire à l'équipe TIVO"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </GsapMagnetic>
              </div>
            </div>

            {/* COLONNE 3 : AIDE & SUPPORT */}
            <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Aide
              </h3>
              <ul className="space-y-2 text-xs flex flex-col items-center sm:items-start">
                <li>
                  <a 
                    href="https://chat.whatsapp.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white hover:underline transition-colors block text-center sm:text-left"
                  >
                    Communauté WhatsApp
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@tivo.bj" 
                    className="text-slate-300 hover:text-white hover:underline transition-colors block text-center sm:text-left"
                  >
                    Nous contacter
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('faq')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Centre d'aide & FAQ
                  </button>
                </li>
                <li>
                  <a
                    href="https://chat.whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium flex items-center justify-center sm:justify-start gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>Support Gérants (7j/7)</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* COLONNE 4 : ENTREPRISE & PRODUIT */}
            <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Entreprise
              </h3>
              <ul className="space-y-2 text-xs flex flex-col items-center sm:items-start">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('tarifs')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Tarification & Abonnements
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('avant-apres')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block underline decoration-blue-400/50 underline-offset-4 font-semibold text-center sm:text-left"
                  >
                    À propos & Pourquoi TIVO
                  </button>
                </li>
                <li>
                  <span className="text-slate-400 cursor-default block text-center sm:text-left">
                    Affiliation & Réseau Kiosques
                  </span>
                </li>
              </ul>
            </div>

            {/* COLONNE 5 : MENTIONS LÉGALES (OUVERTURE INSTANTANÉE DES DOCUMENTS) */}
            <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Mentions légales
              </h3>
              <ul className="space-y-2 text-xs flex flex-col items-center sm:items-start">
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('cgu')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Conditions générales
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('livraison')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Politique de livraison
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('attestation')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Attestation légale
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('confidentialite')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('remboursement')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Politique de remboursement
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal('annulation')}
                    className="text-slate-300 hover:text-white hover:underline transition-colors cursor-pointer block text-center sm:text-left"
                  >
                    Politique d'annulation
                  </button>
                </li>
              </ul>
            </div>

          </ScrollReveal>

          {/* SIGNATURE TYPOGRAPHIQUE GÉANTE "TIVO" (100% RESPONSIVE SANS SCROLL HORIZONTAL) */}
          <ScrollReveal animation="zoom-in" delay={150} className="relative overflow-hidden select-none pointer-events-none text-center -mx-4 sm:-mx-6 lg:-mx-8 pt-4 sm:pt-6">
            <span className="block font-black tracking-tighter text-[19vw] sm:text-[21vw] lg:text-[210px] xl:text-[250px] leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-blue-300/20 via-blue-500/5 to-transparent">
              TIVO
            </span>
          </ScrollReveal>

          {/* LIGNE DE COPYRIGHT INFÉRIEURE RESPONSIVE */}
          <ScrollReveal animation="fade-up" delay={100} className="pt-6 border-t border-blue-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left">
            <p>© {new Date().getFullYear()} TIVO Inc. Tous droits réservés.</p>
            <p className="flex items-center justify-center sm:justify-end gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Conforme réglementation BCEAO & UEMOA • Bénin • Côte d'Ivoire • Togo • Sénégal</span>
            </p>
          </ScrollReveal>

        </div>
      </footer>

      {/* ========================================================
          10. BOUTON FLOTTANT DE CHANGEMENT DE THÈME (COIN BAS À DROITE)
         ======================================================== */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        <GsapMagnetic strength={0.25}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="p-3.5 sm:p-4 rounded-full bg-white/95 dark:bg-[#0C1527]/95 backdrop-blur-md border border-slate-200/90 dark:border-blue-800/60 text-slate-700 dark:text-amber-400 shadow-2xl shadow-slate-900/20 dark:shadow-black/80 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-800 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
        </GsapMagnetic>
      </div>

    </div>
  );
};
