import React, { useState } from 'react';
import { 
  Check, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Store, 
  Crown, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { SubscriptionPlan } from '../../context/AuthContext';
import { ScrollReveal } from './ScrollReveal';
import { GsapTilt, GsapPulseBadge } from './GsapEffects';

interface PricingSectionProps {
  onSelectPlan: (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual') => void;
  currentPlan?: SubscriptionPlan;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  onSelectPlan, 
  currentPlan 
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section id="tarifs" className="w-full py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Halo d'ambiance doux (non néon) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* EN-TÊTE DE SECTION AVEC TOGGLE MENSUEL / ANNUEL */}
        <ScrollReveal animation="fade-up" className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3 border border-blue-200 dark:border-blue-900/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarification Transparente & Adaptée aux Kiosques</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Des tarifs simples pour booster vos bénéfices
          </h2>
          
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Testez TIVO gratuitement pendant 7 jours. Sans engagement, zéro carte bancaire requise.
          </p>

          {/* Toggle Mensuel / Annuel */}
          <div className="mt-7 inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-[#0A1224] border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-[#132038] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-blue-800/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Facturation mensuelle
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-[#132038] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-blue-800/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Facturation annuelle</span>
              <GsapPulseBadge scaleAmount={1.05} duration={1.2} className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                -20% à -25%
              </GsapPulseBadge>
            </button>
          </div>
        </ScrollReveal>

        {/* GRILLE DES 3 PALIERS (Fidèle à la capture : Basic, Pro, Max) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* ========================================================
              CARTE 1 : BASIC (Gratuit 7 jours • Droit au Plan Pro)
             ======================================================== */}
          <ScrollReveal animation="fade-up" delay={50} className="h-full">
            <GsapTilt maxTilt={4} className="h-full rounded-3xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-800/80 p-6 sm:p-7 flex flex-col justify-between shadow-sm dark:shadow-md relative overflow-hidden transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700">
              <div>
                {/* Badge & Titre */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                      BASIC
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      7j Gratuits
                    </span>
                    {currentPlan === 'free' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Actuel
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                    Accès Pro Offert
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gratuit pendant 7 jours donnant accès au Plan Pro complet
                </p>

                {/* Quota Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-[#0E1F3B] border border-blue-200/80 dark:border-blue-900/60 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Droit au Plan Pro pendant 7 jours</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-blue-200/80 mt-1 space-y-0.5">
                    <p>= Testez 100% des fonctions Pro sans restriction</p>
                    <p>~ Scan OCR SMS, Multi-opérateurs & Clôtures PDF</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>100% Gratuit pendant 7 jours sans carte</span>
                  </div>
                </div>

                {/* Prix */}
                <div className="mt-5 flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0 whitespace-nowrap">
                    0 FCFA
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap shrink-0">
                    pendant 7 jours (Plan Pro inclus)
                  </span>
                </div>

                {/* Bouton d'action */}
                <button
                  type="button"
                  onClick={() => onSelectPlan('free', billingCycle)}
                  className="mt-5 w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Tester Pro Gratuit (7 jours)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Liste des fonctionnalités */}
                <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-5 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Accès complet fonctionnalités Pro pendant 7j</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Transactions illimitées (MoMo, Moov, Celtis)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Scan OCR automatique des SMS de transfert</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Billetage guidé avec calcul d'écart 0 FCFA</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Gestion des dettes et relances WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Clôture journalière & exports PDF</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 opacity-50 select-none">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Multi-kiosques & gestion de flotte</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Bloqué
                    </span>
                  </div>
                </div>
              </div>

              {/* Note informative d'essai */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E172C] border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                    <span>Après les 7 jours :</span>
                    <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                      Passage au choix
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Clôturez votre caisse et téléchargez vos bilans en PDF pendant toute la durée de votre essai.
                  </p>
                </div>
              </div>

              {/* Checklist finale */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Autonome Hors-Ligne & synchronisation Cloud</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sans engagement, aucune carte bancaire requise</span>
                </div>
              </div>
            </GsapTilt>
          </ScrollReveal>

          {/* ========================================================
              CARTE 2 : PRO KIOSQUE (🔥 LE PLUS POPULAIRE - BLEU SOBER & LUMINEUX)
             ======================================================== */}
          <ScrollReveal animation="zoom-in" delay={150} className="h-full">
            <GsapTilt maxTilt={4} className="h-full rounded-3xl bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-[#0E1E3A] dark:via-[#0C172B] dark:to-[#0A1220] border-2 border-blue-600 dark:border-blue-500/80 p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-200 scale-[1.02] lg:-translate-y-2 z-20">
              {/* Lueur subtile raffinée (pas de néon flashy) */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Badge En-tête */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                      PRO
                    </h3>
                    <GsapPulseBadge scaleAmount={1.06} duration={1.4} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider shadow-xs">
                      {billingCycle === 'annual' ? '20% OFF' : 'POPULAIRE'}
                    </GsapPulseBadge>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Recommandé</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-blue-200/80 mt-1">
                  Pour les gérants de kiosques actifs et points Mobile Money
                </p>

                {/* Quota Box */}
              <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-[#102344]/50 border border-blue-200 dark:border-blue-800/40 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Transactions Illimitées / mois</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-blue-200/80 mt-1 space-y-0.5">
                  <p>= 3 Opérateurs (MTN MoMo, Moov Money, Celtis Cash)</p>
                  <p>~ Scan OCR instantané & Sauvegarde Cloud</p>
                </div>
                {/* Visual slider élégant */}
                <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                  <span>600 tx/mois</span>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-blue-200 dark:bg-blue-950 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-4/5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                  </div>
                  <span>Illimité</span>
                </div>
              </div>

              {/* Prix */}
              <div className="mt-5 flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
                {billingCycle === 'annual' && (
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 line-through shrink-0">
                    4 900
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0 whitespace-nowrap">
                  {billingCycle === 'annual' ? '3 900 FCFA' : '4 900 FCFA'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-blue-200/80 font-medium whitespace-nowrap shrink-0">
                  / mois
                </span>
              </div>

              {/* Bouton d'action avec dégradé bleu royal / indigo */}
              <button
                type="button"
                onClick={() => onSelectPlan('pro', billingCycle)}
                className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm transition-all duration-150 shadow-md shadow-blue-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
              >
                <span>Choisir le Plan Pro</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-500 dark:text-blue-300/80 mt-2 font-medium">
                {billingCycle === 'annual' ? 'Économisez 12 000 FCFA par an (2 mois offerts)' : 'Sans engagement, résiliation en 1 clic'}
              </p>

              {/* SECTION 1 : FONCTIONNALITÉS INCLUSES */}
              <div className="mt-6 pt-5 border-t border-blue-100 dark:border-blue-900/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-3 flex items-center justify-between">
                  <span>Tout le plan Basic, plus :</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">Inclus</span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Scan photo & import OCR automatique des SMS</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Multi-opérateurs illimités (MTN, Moov, Celtis)</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Carnet d'avances & dettes clients avec relances</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Mode Hors-Ligne 100% autonome & synchro Cloud</span>
                  </li>
                </ul>
              </div>

              {/* SECTION 2 : BLOC CLÔTURE DÉVERROUILLÉ */}
              <div className="mt-5 p-3 rounded-2xl bg-blue-50/80 dark:bg-[#102344]/50 border border-blue-200 dark:border-blue-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>CLÔTURE SCELLÉE & EXPORTS PDF</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    Accès Total
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-blue-100">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Clôture journalière avec signature numérique</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Export illimité PDF, Excel & Reçus thermiques</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist finale & verrouillé business */}
            <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/40 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-blue-100">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sauvegarde automatique dans le Cloud</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-blue-100">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Alertes intelligentes de seuil caisse & UV</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 opacity-50 select-none">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Multi-kiosques & supervision flotte</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Plan Business
                </span>
              </div>
            </div>
            </GsapTilt>
          </ScrollReveal>

          {/* ========================================================
              CARTE 3 : MAX / BUSINESS (MULTI-KIOSQUES & AGENCES - INDIGO / VIOLET NOBLE)
             ======================================================== */}
          <ScrollReveal animation="fade-up" delay={250} className="h-full">
            <GsapTilt maxTilt={4} className="h-full rounded-3xl bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-[#14122C] dark:via-[#0E1226] dark:to-[#080B1A] border border-indigo-200 dark:border-indigo-900/50 p-6 sm:p-7 flex flex-col justify-between shadow-md dark:shadow-xl relative overflow-hidden transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700/50">
            {/* Lueur subtile (pas de néon flashy) */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Badge En-tête */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                    MAX
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                    {billingCycle === 'annual' ? '25% OFF' : 'BUSINESS'}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <span>💎 Best Value</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Pour les propriétaires de plusieurs kiosques, flottes & agences
              </p>

              {/* Quota Box */}
              <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-[#151936]/40 border border-indigo-200 dark:border-indigo-800/40 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Kiosques & Caisses Illimités</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-indigo-200/80 mt-1 space-y-0.5">
                  <p>= Supervision multi-points centralisée</p>
                  <p>~ Rôles Superviseur, Gérants & Caissiers</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                  <span>1 Kiosque</span>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-indigo-200 dark:bg-indigo-950 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" />
                  </div>
                  <span>Flottes Illimitées</span>
                </div>
              </div>

              {/* Prix */}
              <div className="mt-5 flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
                {billingCycle === 'annual' && (
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 line-through shrink-0">
                    14 900
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0 whitespace-nowrap">
                  {billingCycle === 'annual' ? '11 900 FCFA' : '14 900 FCFA'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap shrink-0">
                  / mois
                </span>
              </div>

              {/* Bouton d'action avec dégradé indigo / violet sombre chic */}
              <button
                type="button"
                onClick={() => onSelectPlan('business', billingCycle)}
                className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 dark:to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm transition-all duration-150 shadow-md shadow-indigo-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                <span>Passer à Business Max</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {billingCycle === 'annual' ? 'Économisez 36 000 FCFA par an' : 'Sans engagement, résiliation en 1 clic'}
              </p>

              {/* SECTION 1 : TOUT DÉVERROUILLÉ */}
              <div className="mt-6 pt-5 border-t border-indigo-100 dark:border-indigo-900/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3 flex items-center justify-between">
                  <span>Tout le plan Pro, plus :</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">100% Inclus</span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>Multi-kiosques & gestion de flotte centralisée</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>Supervision de plusieurs caissiers en simultané</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>Rôles & autorisations avancées (Admin, Gérant, Caissier)</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-800 dark:text-white font-medium">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>Détection prédictive de fraudes & alertes écarts</span>
                  </li>
                </ul>
              </div>

              {/* SECTION 2 : BLOC AUDIT & SÉCURITÉ COMPLÈTE */}
              <div className="mt-5 p-3 rounded-2xl bg-indigo-50/80 dark:bg-[#151936]/40 border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>AUDIT TRAIL & CONSOLIDATION</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    Enterprise
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-indigo-100">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Piste d'audit inviolable & horodatage des opérations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Bilans comptables consolidés pour tous les points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist finale */}
            <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-indigo-100">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Synchronisation multi-appareils en temps réel</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-indigo-100">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Support prioritaire VIP WhatsApp 24/7 dédié</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-indigo-100">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Formation offerte de votre équipe de caissiers</span>
              </div>
            </div>
            </GsapTilt>
          </ScrollReveal>

        </div>

        {/* BANDEAU DE RÉASSURANCE SOUS LES PRIX */}
        <ScrollReveal animation="fade-up" delay={100} className="mt-14 p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#0B1426] border border-slate-200 dark:border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-around gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Paiements Mobile Money locaux (MTN MoMo, Moov Money, Wave)</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Activation immédiate de votre compte sans attente</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>7 jours d'essai sans engagement sur le plan Pro</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
