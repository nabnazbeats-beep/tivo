import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, Scale, Truck, RotateCcw, AlertTriangle } from 'lucide-react';

export type LegalDocType = 'cgu' | 'livraison' | 'attestation' | 'confidentialite' | 'remboursement' | 'annulation';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'cgu',
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  useEffect(() => {
    if (isOpen && initialDoc) {
      setActiveDoc(initialDoc);
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  const docs = [
    { id: 'cgu', label: 'Conditions Générales', icon: FileText },
    { id: 'livraison', label: 'Politique de Livraison', icon: Truck },
    { id: 'attestation', label: 'Attestation Légale', icon: Scale },
    { id: 'confidentialite', label: 'Confidentialité', icon: Lock },
    { id: 'remboursement', label: 'Remboursement', icon: RotateCcw },
    { id: 'annulation', label: 'Annulation', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#091124] border border-blue-900/50 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la Modale */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Centre Légal & Conformité TIVO</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  UEMOA Conforme
                </span>
              </h2>
              <p className="text-xs text-blue-100/90 font-normal">
                Transparence totale, protection des fonds et conformité juridique
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets de navigation entre documents */}
        <div className="flex items-center gap-1.5 p-2.5 sm:p-3 bg-[#060D1E] border-b border-blue-900/40 overflow-x-auto no-scrollbar">
          {docs.map((doc) => {
            const Icon = doc.icon;
            const isActive = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveDoc(doc.id as LegalDocType)}
                className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{doc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu Défilant du Document */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          
          {/* 1. CGU */}
          {activeDoc === 'cgu' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Conditions Générales d'Utilisation (CGU)</h3>
              <p className="text-xs text-slate-400">Dernière mise à jour : 1er Janvier 2026</p>
              
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Objet du Service</h4>
                <p>
                  TIVO est une application web et mobile SaaS de gestion de caisse, billetage guidé, et comptabilité de trésorerie dédiée exclusivement aux gérants de kiosques et points de vente Mobile Money (MTN MoMo, Moov Money, Celtis Cash, Wave) dans l'espace UEMOA.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Accès et Fonctionnement Hors-Ligne</h4>
                <p>
                  L'application dispose d'une technologie Offline-First. Le client reconnaît que les données enregistrées sans connexion Internet sont stockées localement sur son terminal et synchronisées de manière sécurisée dès rétablissement de la connexion.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Responsabilité du Gérant</h4>
                <p>
                  Le Gérant reste seul responsable de l'exactitude des montants de fond de caisse saisis et des transactions enregistrées. TIVO fournit les outils de calcul, de contrôle d'écart et de billetage, mais ne se substitue pas à la gestion humaine de la caisse physique.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">4. Propriété des Données</h4>
                <p>
                  Toutes les données comptables et l'historique des opérations demeurent la propriété exclusive de l'utilisateur. TIVO s'engage à ne jamais vendre, louer ou divulguer les états financiers à des tiers.
                </p>
              </div>
            </div>
          )}

          {/* 2. POLITIQUE DE LIVRAISON */}
          {activeDoc === 'livraison' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Politique de Livraison & Activation Numérique</h3>
              <p className="text-xs text-slate-400">Service 100% Numérique et Instantané</p>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Activation Instantanée</h4>
                <p>
                  TIVO étant un logiciel SaaS (Software as a Service), aucun colis physique n'est expédié. L'accès aux fonctionnalités du plan choisi (Basic, Pro, Max) est activé instantanément dès la confirmation d'inscription ou la validation du règlement Mobile Money.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Modalités d'accès</h4>
                <p>
                  L'utilisateur accède à sa caisse via son navigateur web ou via l'application installée (PWA) sur smartphone Android ou iOS. Les identifiants de connexion sont envoyés immédiatement par email et confirmation WhatsApp.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Disponibilité du Service</h4>
                <p>
                  Le service est garanti accessible 24h/24 et 7j/7 avec un taux de disponibilité supérieur à 99,8%, y compris en mode hors-ligne lorsque votre réseau GSM ou Internet est indisponible.
                </p>
              </div>
            </div>
          )}

          {/* 3. ATTESTATION LÉGALE */}
          {activeDoc === 'attestation' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Attestation Légale & Conformité Réglementaire</h3>
              <p className="text-xs text-slate-400">Conformité aux règles financières de l'UEMOA</p>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Statut Juridique</h4>
                <p>
                  TIVO est édité par TIVO Inc., société de technologie financière immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) pour la conception de solutions d'encaissement et de gestion numérique.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Rôle d'Outil de Gestion</h4>
                <p>
                  TIVO agit en tant qu'outil informatique d'assistance comptable et de contrôle interne de trésorerie. TIVO ne collecte pas de dépôts du public et ne se substitue pas aux institutions émettrices de monnaie électronique agréées par la BCEAO.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Valeur Probante des Rapports de Caisse</h4>
                <p>
                  Les rapports de clôture quotidienne générés par TIVO intègrent un scellement numérique horodaté et une signature de caisse, recevables comme pièces justificatives d'inventaire et de gestion comptable interne.
                </p>
              </div>
            </div>
          )}

          {/* 4. POLITIQUE DE CONFIDENTIALITÉ */}
          {activeDoc === 'confidentialite' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Politique de Confidentialité & Sécurité des Données</h3>
              <p className="text-xs text-slate-400">Chiffrement AES-256 et secret des affaires</p>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Données Collectées</h4>
                <p>
                  Nous ne collectons que les informations strictement indispensables au fonctionnement de votre caisse : nom de l'agence, numéro WhatsApp de notification, soldes saisis et historique des transactions.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Chiffrement et Sauvegarde</h4>
                <p>
                  Toutes les données en transit sont protégées par le protocole SSL/TLS et chiffrées en base selon le standard bancaire AES-256. Les sauvegardes sont répliquées quotidiennement pour prévenir toute perte matérielle.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Mode Discrétion Kiosque</h4>
                <p>
                  L'interface intègre une fonctionnalité d'occultation des montants (icône œil) permettant au gérant de masquer ses soldes globaux et bénéfices en direct devant les clients et passants.
                </p>
              </div>
            </div>
          )}

          {/* 5. POLITIQUE DE REMBOURSEMENT */}
          {activeDoc === 'remboursement' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Politique de Remboursement — Essai 7 Jours Garanti</h3>
              <p className="text-xs text-slate-400">Garantie « Satisfait ou Remboursé »</p>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Essai Gratuit de 7 Jours</h4>
                <p>
                  Tout nouveau compte bénéficie d'une période d'essai de 7 jours complets donnant accès à l'ensemble des fonctionnalités du Plan Pro sans aucun engagement ni obligation de carte bancaire.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Droit de Rétractation</h4>
                <p>
                  Si un abonnement payant est souscrit et que le service ne vous donne pas entière satisfaction, vous pouvez demander le remboursement intégral sans justification dans un délai de 7 jours ouvrés suivant la transaction.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Procédure de Demande</h4>
                <p>
                  Un simple message au support WhatsApp officiel ou un email à support@tivo.bj avec votre numéro de kiosque suffit. Le recrédit s'effectue directement sur votre compte Mobile Money d'origine sous 24 à 48 heures.
                </p>
              </div>
            </div>
          )}

          {/* 6. POLITIQUE D'ANNULATION */}
          {activeDoc === 'annulation' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base sm:text-lg font-bold text-white">Politique d'Annulation & Résiliation Sans Engagement</h3>
              <p className="text-xs text-slate-400">Liberté totale en 1 clic</p>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">1. Zéro Engagement</h4>
                <p>
                  Les abonnements TIVO sont conclus sans engagement de durée minimale. Vous êtes libre de suspendre ou d'interrompre votre abonnement à tout moment depuis les paramètres de votre compte.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">2. Fin de Période</h4>
                <p>
                  En cas d'annulation en cours de cycle mensuel ou annuel, votre accès aux fonctionnalités Pro ou Max reste actif jusqu'à la fin de la période déjà facturée. Aucun prélèvement ultérieur ne sera opéré.
                </p>

                <h4 className="font-bold text-white text-xs sm:text-sm">3. Conservation des Données</h4>
                <p>
                  Même après annulation d'un abonnement payant, vos bilans comptables passés restent consultables et téléchargeables en PDF pour vos besoins fiscaux et d'archivage.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer de la Modale */}
        <div className="p-4 sm:p-5 bg-[#060D1E] border-t border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Document contractuel authentifié par TIVO Inc.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
