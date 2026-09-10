# 📘 TIVO — Spécification Globale & Architecture Complète du Projet

> **Document de Référence Technique & Fonctionnelle**  
> Ce document est conçu pour être transmis à tout développeur, chef de projet ou intelligence artificielle (LLM) afin de comprendre instantanément l'intégralité de la plateforme TIVO : sa vision, son architecture logicielle, l'ensemble de ses fonctionnalités, son modèle de données et son écosystème de déploiement.

---

## 1. 🎯 Vision & Contexte Métier

### 1.1 Présentation Générale
**TIVO** est une plateforme SaaS financière tout-en-un conçue spécifiquement pour les **gérants de kiosques Mobile Money et points de vente multi-services en Afrique de l'Ouest** (zone UEMOA : Bénin, Côte d'Ivoire, Togo, Sénégal, etc.).

L'application résout les trois douleurs majeures vécues quotidiennement par les opérateurs de kiosques :
1. **La fin du cahier papier et des erreurs de calcul** : automatisation complète des saisies de dépôts/retraits et des commissions en moins de 5 secondes.
2. **Le travail en zone blanche ou coupure de réseau** : fonctionnement **100% Hors-Ligne (Offline-First)** avec mise en file d'attente locale et synchronisation automatique dès le retour d'Internet.
3. **La transparence absolue et la lutte contre le vol/fraude** : clôture journalière scellée par code PIN avec billetage des coupures FCFA, ticket thermique infalsifiable et moteur de détection des doubles transactions.

### 1.2 Réseaux & Devises Supportés
- **Réseaux Mobile Money** : MTN Mobile Money (MoMo), Moov Money (Flooz), Celtis Cash, Wave, et Caisse Espèces (Cash physique).
- **Zone Monétaire** : Franc CFA BCEAO (XOF / FCFA).
- **Devises de change intégrées** : Naira nigérian (NGN), Euro (EUR), Dollar américain (USD).

---

## 2. 🛠️ Stack Technologique & Architecture Logicielle

### 2.1 Technologies Clés
- **Framework Front-End** : React 19 (TypeScript 5.7)
- **Outil de Build & Bundler** : Vite 6 (ES2020, HMR instantané, chunking optimisé)
- **Système de Style & UI** : Tailwind CSS 3.4 (mode sombre/clair natif `class="dark"`, système de tokens, glassmorphism soyeux `backdrop-blur`)
- **Moteur d'Animations** : GSAP 3.15 (GreenSock) + CSS GPU-accelerated transitions
  - Effets d'inclinaison physique 3D (`GsapTilt`)
  - Attraction magnétique au curseur (`GsapMagnetic`)
  - Pulsations continues des badges (`GsapPulseBadge`)
  - Balayage laser dynamique pour l'OCR (`GsapScannerLine`)
  - Défilement fluide & apparitions rythmées (`ScrollReveal` avec `IntersectionObserver`, 900ms ease-out)
- **Icônes** : Lucide React (vectorielles, légères, adaptatives)
- **Exports & Documents** : `jspdf` & `html2canvas` (génération de reçus thermiques 58mm/80mm et bilans comptables PDF A4)
- **PWA (Progressive Web App)** : Service Worker v2.2, Web App Manifest complet, icônes adaptatives maskables haute résolution (Android & iOS)
- **Persistance & Synchronisation** : LocalStorage / IndexedDB (chiffrement local, file d'attente hors-ligne) + Intégration backend **Supabase** (PostgreSQL, Authentification, MCP Server)

### 2.2 Arborescence du Code Source
```text
c:\Users\nabna\Desktop\TIVO\
├── public/
│   ├── favicon.png                  # Favicon navigateur
│   ├── logo-tivo.png                # Logo officiel de marque (1024x682)
│   ├── manifest.json                # Configuration PWA officielle
│   ├── sw.js                        # Service Worker (gestion du cache hors-ligne)
│   ├── sounds/                      # Alertes sonores réalistes (TIVO Notif song.wav)
│   └── icons/
│       ├── icon-192.png             # Icône Android tiroir d'applications (192x192)
│       ├── icon-512.png             # Icône haute résolution (512x512)
│       ├── icon-maskable.png        # Icône adaptative plein cadre (512x512, sans bord blanc)
│       └── apple-touch-icon.png     # Icône dédiée iPhone Safari (180x180)
├── src/
│   ├── App.tsx                      # Routeur applicatif & bascule Landing Page / POS App
│   ├── main.tsx                     # Point d'entrée React 19 avec tous les Context Providers
│   ├── index.css                    # Design system, variables CSS, utilitaires glassmorphism
│   ├── context/                     # Gestion d'état global réactif
│   │   ├── AuthContext.tsx          # Gestion de session agent / kiosque / PIN
│   │   ├── TransactionContext.tsx   # Journal de transactions, soldes, opérations
│   │   ├── NetworkContext.tsx       # État des portefeuilles opérateurs (MTN, Moov, Celtis, Cash)
│   │   ├── CurrencyContext.tsx      # Taux de change et conversions temps réel
│   │   ├── AuditContext.tsx         # Journal d'audit et détection de fraude
│   │   ├── NotificationContext.tsx  # Alertes push, sonores et centre d'activité
│   │   ├── ThemeContext.tsx         # Bascule Dark/Light mode avec persistance
│   │   └── AgencyContext.tsx        # Configuration kiosque, coordonnées, devise
│   ├── landing/                     # Vitrine Marketing & Conversion
│   │   ├── LandingPage.tsx          # Page d'accueil moderne (9 sections complètes)
│   │   └── components/
│   │       ├── AuthModal.tsx        # Modale de connexion / inscription rapide
│   │       ├── LegalModal.tsx       # Modale juridique (6 documents contractuels)
│   │       ├── PricingSection.tsx   # Grille tarifaire interactive mensuelle/annuelle
│   │       ├── ScrollReveal.tsx     # Système d'animations d'entrée au défilement
│   │       └── GsapEffects.tsx      # Composants interactifs GSAP (Tilt, Magnetic, Scanner, Pulse)
│   ├── transactions/                # Gestion des opérations financières
│   │   ├── NewTransactionScreen.tsx # Guichet de saisie ultra-rapide (< 5s)
│   │   ├── HistoryScreen.tsx        # Historique détaillé, filtres avancés, recherche
│   │   ├── TransactionConfirmationScreen.tsx # Écran de validation & récapitulatif
│   │   └── TransactionInvoiceModal.tsx       # Ticket de caisse thermique imprimable / PDF
│   ├── closure/                     # Clôture journalière & Billetage
│   │   └── DailyClosureScreen.tsx   # Décompte coupures FCFA, scellement PIN, rapport PDF
│   ├── debts/                       # Carnet d'avances & Crédits clients
│   │   └── DebtsScreen.tsx          # Suivi des créances, relances WhatsApp 1-clic
│   ├── import/                      # Import intelligent & Scanner
│   │   ├── ImportTransactionScreen.tsx # Scanner de SMS MoMo et captures reçus
│   │   └── smartParser.ts           # Moteur regex d'extraction automatique des SMS
│   ├── audit/                       # Sécurité & Audit
│   │   ├── AuditSecurityScreen.tsx  # Journal des événements suspects et logs
│   │   └── fraudEngine.ts           # Algorithmes de détection d'anomalies financières
│   ├── tariffs/                     # Calculateur de commissions UEMOA
│   │   ├── TariffCalculatorScreen.tsx # Simulateur de frais clients et gains kiosque
│   │   └── tariffData.ts            # Barèmes officiels MTN, Moov, Celtis
│   ├── currency/                    # Guichet de change de devises
│   │   ├── CurrencyExchangeScreen.tsx # Convertisseur FCFA, NGN, EUR, USD
│   │   ├── currencyData.ts          # Données et spreads de change
│   │   └── currencyEngine.ts        # Calculs de commissions de change
│   ├── networks/                    # Flotte et soldes des puces
│   │   └── NetworkBalancesScreen.tsx # Supervision des soldes UV MTN, Moov, Celtis, Cash
│   ├── notifications/               # Alertes & Sons
│   │   ├── NotificationCenterScreen.tsx # Centre d'alertes
│   │   ├── NotificationSettingsModal.tsx # Réglages sonores et push
│   │   └── notificationEngine.ts    # Déclenchement sons natifs et toasts
│   ├── offline/                     # Robustesse hors-connexion
│   │   └── OfflineSyncModal.tsx     # Modale de file d'attente et synchronisation réseau
│   ├── profile/                     # Profil gérant & Pièces officielles
│   │   ├── ProfileScreen.tsx        # Paramètres compte, kiosque, sécurité PIN
│   │   └── OfficialIdPhotoModal.tsx # Prise de photo CNI / CIP / Passeport
│   └── design-system/               # Composants réutilisables
│       ├── components/              # TivoButton, TivoCard, TivoField, TivoBadge, TivoHeader, etc.
│       └── tokens/                  # Couleurs HSL, typographie, espacements
```

---

## 3. 🌐 La Landing Page (Vitrine Marketing)

La Landing Page est accessible sur la racine `/` lorsque l'utilisateur n'est pas connecté ou clique sur "Découvrir TIVO". Elle comprend 9 sections immersives conçues avec des animations d'entrée soignées (900ms) et des micro-interactions GSAP :

### 3.1 En-tête Flottant (Navbar Glassmorphism)
- Barre de navigation translucide (`backdrop-blur-xl bg-white/70 dark:bg-[#0A1224]/75`).
- Logo officiel TIVO à gauche.
- Liens d'ancrage avec défilement fluide vers `#features` (Fonctionnalités), `#avantages` (Comparatif), `#tarifs` (Prix), `#avis` (Témoignages), `#faq` (FAQ).
- Bouton interactif d'authentification "Connexion / Inscription".
- Bouton de changement de thème Sombre/Clair.

### 3.2 Hero Section (Section Principale)
- Titre accrocheur adapté aux réalités africaines : *"La caisse de votre kiosque Mobile Money, 100% maîtrisée."*
- Sous-titre valorisant le gain de temps et la rentabilité.
- Boutons d'action : *"Créer mon compte gratuitement"* (avec attraction magnétique GSAP) et *"Voir la démo"*.
- **Mockup Smartphone 3D Interactif** :
  - Encapsulé dans un effet d'inclinaison physique au survol (`GsapTilt`).
  - Affiche en direct l'écran d'une caisse en pleine action (total solde, compteurs UV, bouton d'enregistrement).
  - Cartes flottantes en temps réel : *"Écart de caisse : 0 FCFA ✓"* et *"Mode Hors-Ligne Actif ⚡"*.

### 3.3 Bento Grid des Fonctionnalités (`#features`)
Une grille moderne de 6 cases asymétriques avec **micro-interfaces d'arrière-plan en glassmorphism** haute fidélité (opacité calibrée à 85% par défaut, 100% au survol) sans aucun débordement (`overflow-hidden`) :
1. **Billetage FCFA Automatisé** : Décompte tactile des coupures (10 000, 5 000, 2 000, 1 000, 500 FCFA et pièces). Zéro erreur de calcul le soir.
2. **Scan Photo & OCR Intelligent** : Faisceau laser animé avec GSAP (`GsapScannerLine`) scannant un SMS de notification MoMo pour une saisie sans toucher le clavier.
3. **Multi-Opérateurs Centralisé** : Supervision consolidée des unités virtuelles (UV) MTN MoMo, Moov Money, Celtis Cash et espèces dans une seule vue.
4. **100% Hors-Ligne (Offline-First)** : Enregistrement complet des dépôts/retraits même sans connexion Internet, avec indicateur de synchronisation automatique.
5. **Carnet de Dettes & Avances** : Fini les pertes d'argent prêté aux clients ; suivi rigoureux des avances avec bouton de relance WhatsApp 1-clic.
6. **Clôture Journalière Scellée** : Ticket de fin de journée thermique sécurisé par code PIN secret, prêt à exporter en PDF ou imprimer.

### 3.4 Comparatif Avant / Après TIVO (`#avantages`)
- Animation gauche / droite dynamique :
  - **Sans TIVO (À gauche, carte rouge/grise, glisse depuis la gauche)** : Cahier papier froissé, erreurs de calculs manuelles, pertes de 5 000 à 10 000 FCFA/semaine, stress de la fermeture, pas de traçabilité des crédits clients.
  - **Avec TIVO (À droite, carte bleu royal/vert, glisse depuis la droite)** : Écart de caisse à 0 F garanti, clôture scellée en 2 minutes, tickets thermiques automatiques, relances WhatsApp, esprit tranquille.

### 3.5 Grille Tarifaire Interactive (`#tarifs`)
- Commutateur interactif Mensuel / Annuel (avec badge pulsant GSAP `-20% à -25% d'économie`).
- Trois plans adaptés à la taille de chaque point de vente :
  - **Starter (Basique)** : 1 Kiosque, 1 Caissier, gestion des opérations de base.
  - **Pro (Recommandé - Badge GSAP Populaire)** : Multi-réseaux illimité, billetage complet, OCR SMS, carnet de dettes, exports PDF.
  - **Business / Flotte (Max)** : Multi-kiosques, multi-caissiers, supervision à distance par le propriétaire, alertes anti-fraude prioritaires.
- Le clic sur n'importe quel plan pré-remplit la modale d'inscription.

### 3.6 Témoignages des Gérants (`#avis`)
- Badge 5 étoiles dorées alignées horizontalement à gauche du label *"Recommandé par les gérants"* avec pulsation douce GSAP.
- Témoignages réels et crédibles de gérants de Cotonou (Marché Dantokpa), Abidjan (Yopougon) et Lomé.

### 3.7 Foire Aux Questions (FAQ Accordéon)
- Questions fréquentes traitant de la connexion Internet (mode hors-ligne), de la sécurité des données, de la compatibilité avec les imprimantes thermiques Bluetooth, et de la confidentialité des chiffres d'affaires.

### 3.8 Bannière Appel à l'Action (CTA)
- Bloc royal bleu profond invitant à démarrer l'essai gratuit de 7 jours sans carte bancaire.
- Bouton magnétique GSAP attirant le curseur.

### 3.9 Footer Monumental & Conformité UEMOA
- 5 colonnes organisées : Marque & Présentation, Contact direct (boutons magnétiques WhatsApp et Email), Liens rapides, Support gérants 7j/7, Mentions légales.
- Filigrane géant « TIVO » en arrière-plan avec centrage responsive.
- **Modale Juridique Intégrée (`LegalModal.tsx`)** : Ouverture au clic sans rechargement de page pour consulter les 6 documents officiels :
  1. *Conditions Générales d'Utilisation (CGU)*
  2. *Politique de Livraison (Activation SaaS dématérialisée immédiate)*
  3. *Attestation Légale (Conformité directives BCEAO / UEMOA)*
  4. *Politique de Confidentialité (Chiffrement AES-256)*
  5. *Politique de Remboursement (Garantie satisfaction 7 jours)*
  6. *Politique d'Annulation (Résiliation en 1 clic sans engagement)*

---

## 4. 📱 L'Application Web & POS (Caisse Opérateur)

Une fois connecté, l'agent ou le superviseur a accès à une application de caisse complète :

### 4.1 Guichet de Saisie Rapide (`NewTransactionScreen.tsx`)
- Saisie optimisée pour être exécutée en moins de **5 secondes** face au client.
- Sélection instantanée du type d'opération :
  - **Dépôt** (Cash entrant -> UV sortant)
  - **Retrait** (UV entrant -> Cash sortant)
  - **Transfert direct**
  - **Approvisionnement / Déchargement de caisse**
- Sélection du réseau en un clic (MTN, Moov, Celtis, Wave, Cash).
- Pavé numérique tactile ou saisie directe du montant.
- Calcul automatique en direct des frais clients et des **commissions nettes générées**.
- Alerte sonore instantanée à la confirmation (`TIVO Notif song.wav`).

### 4.2 Ticket de Caisse Thermique & PDF (`TransactionInvoiceModal.tsx`)
- Modale de reçu immédiat après chaque opération.
- Format adapté aux imprimantes thermiques 58mm et 80mm de caisse.
- Contient : Nom du kiosque, Date/Heure, Réf transaction, Type d'opération, Réseau, Numéro client masqué pour confidentialité, Montant, Frais, et Code de vérification.
- Boutons d'action :
  - **Partager sur WhatsApp** : génère un texte de confirmation formaté directement envoyé au client.
  - **Télécharger le reçu PDF** : rendu vectoriel instantané via `jspdf`.
  - **Imprimer** : commande d'impression directe du navigateur / imprimante Bluetooth.

### 4.3 Clôture Journalière & Billetage FCFA (`DailyClosureScreen.tsx`)
- Le module le plus apprécié des propriétaires de kiosques pour éliminer les vols et les déficits.
- **Grille de comptage physique des espèces** :
  - 10 000 FCFA, 5 000 FCFA, 2 000 FCFA, 1 000 FCFA, 500 FCFA (billets).
  - 500 FCFA, 250 FCFA, 200 FCFA, 100 FCFA, 50 FCFA, 25 FCFA (pièces).
- Calcul dynamique automatique du montant théorique attendu vs montant physique réel compté.
- Affichage de l'**Écart de caisse** (Excédent en vert, Équilibre parfait à 0 F, Déficit en rouge).
- **Scellement par code PIN** : une fois scellée, la journée ne peut plus être modifiée par le caissier.
- Génération d'un **Bilan PDF officiel de clôture** à transmettre au propriétaire.

### 4.4 Carnet de Dettes & Avances Clients (`DebtsScreen.tsx`)
- Gestion des crédits accordés aux clients réguliers (voisinage, commerçants du marché).
- Enregistrement du nom, téléphone, montant prêté, date limite de remboursement.
- Indicateur visuel d'urgence (En cours, En retard, Soldé).
- **Bouton de relance WhatsApp 1-clic** : pré-remplit un message poli et précis sur WhatsApp avec le montant dû et la référence.

### 4.5 Scanner Intelligent & OCR de SMS (`ImportTransactionScreen.tsx` & `smartParser.ts`)
- Décode automatiquement les SMS de confirmation envoyés par MTN MoMo, Moov Money et Celtis Cash.
- Analyse par expressions régulières (Regex) avancées : extrait en temps réel le montant, le numéro de téléphone du client, la référence de transaction de l'opérateur et le solde restant.
- Évite les erreurs de frappe humaine et accélère le passage des clients aux heures de pointe.

### 4.6 Moteur Anti-Fraude & Audit (`AuditSecurityScreen.tsx` & `fraudEngine.ts`)
- Surveillance en arrière-plan de chaque transaction.
- Détection proactive :
  - Double saisie d'un même numéro de transaction dans un intervalle court.
  - Montants atypiques dépassant les plafonds définis par le gérant.
  - Tentatives d'accès ou d'annulation hors horaires autorisés.
- Score de risque de fraude attribué à chaque anomalie.

### 4.7 Simulateur de Frais & Tarifs UEMOA (`TariffCalculatorScreen.tsx`)
- Intègre les barèmes officiels à jour de MTN Bénin, Moov Africa et Celtis Cash.
- L'opérateur tape un montant : l'outil lui indique exactement les frais à prélever au client et la commission qu'il encaissera sur son compte master.

### 4.8 Guichet de Change de Devises (`CurrencyExchangeScreen.tsx`)
- Outil indispensable pour les kiosques frontaliers ou de grands marchés (Dantokpa, Sèmè-Kraké, Malanville).
- Conversion bidirectionnelle FCFA <-> Naira (NGN), FCFA <-> Euro, FCFA <-> Dollar.
- Calcul automatique de la marge bénéficiaire nette du kiosque sur l'opération de change.

### 4.9 Mode 100% Hors-Ligne (Offline-First) (`OfflineSyncModal.tsx`)
- Détection automatique de l'état réseau (`navigator.onLine` et écouteurs d'événements).
- Lorsque la connexion coupe :
  - Un badge visuel discret prévient l'agent : *"Mode Hors-Ligne Actif"*.
  - Toutes les transactions restent enregistrables localement dans une file sécurisée.
- Dès que la connexion revient :
  - Déclenchement automatique de la synchronisation.
  - Modale interactive avec barre de progression montrant l'envoi des transactions vers le serveur cloud.

---

## 5. 📲 Spécifications PWA & Mobile

### 5.1 Identité Visuelle de l'Application sur Smartphone
- **Nom sous l'icône** : Strictement **`Tivo`** (court, clair, sans "POS").
- **Icône Adaptative Plein Cadre** :
  - Fond en dégradé bleu royal continu (`#017EFB` à `#0042FA`) étendu jusqu'aux 4 bords de l'image (512x512).
  - Symbole « **T** » blanc centré dans la zone de sécurité (safe zone 80%).
  - **Zéro débordement blanc, zéro bordure blanche** : que ce soit sur Android (Samsung, Pixel, Xiaomi) ou iPhone (iOS Safari), le système d'exploitation découpe directement le bleu dans sa forme native (cercle, squircle ou galet).

### 5.2 Fichiers de Configuration PWA
- [`public/manifest.json`](file:///c:/Users/nabna/Desktop/TIVO/public/manifest.json) :
  - `short_name`: `"Tivo"`
  - `name`: `"Tivo"`
  - `display`: `"standalone"`
  - `theme_color`: `"#2563EB"`
  - `background_color`: `"#0A0F1A"`
  - Déclaration propre des icônes `any` (192x192, 512x512) et `maskable` (512x512).
- [`public/sw.js`](file:///c:/Users/nabna/Desktop/TIVO/public/sw.js) :
  - Cache v2.2 avec mise en cache prédictive des assets critiques pour un démarrage instantané à froid (0 seconde).

---

## 6. 🗄️ Modèle de Données (Structure JSON & Types Clés)

### 6.1 Transaction (`Transaction`)
```typescript
export interface Transaction {
  id: string;                      // Identifiant unique (UUID ou timestamp)
  type: 'deposit' | 'withdrawal' | 'transfer' | 'cash_in' | 'cash_out';
  network: 'mtn' | 'moov' | 'celtis' | 'wave' | 'cash';
  amount: number;                  // Montant principal en FCFA
  fee: number;                     // Frais facturés au client
  commission: number;              // Commission nette gagnée par le kiosque
  customerPhone?: string;          // Numéro du client (optionnel)
  customerName?: string;           // Nom ou référence client
  operatorReference?: string;      // Réf SMS opérateur (ex: TxID 198273645)
  timestamp: number;               // Date/heure Unix en millisecondes
  status: 'completed' | 'pending_sync' | 'cancelled';
  agentId: string;                 // Identifiant de l'agent caissier
  synced: boolean;                 // Booléen de synchronisation cloud
}
```

### 6.2 Clôture Journalière (`DailyClosure`)
```typescript
export interface DailyClosure {
  id: string;
  date: string;                    // Format YYYY-MM-DD
  openingTime: number;
  closingTime: number;
  expectedCash: number;            // Montant théorique calculé par le système
  countedCash: number;             // Montant réel compté lors du billetage
  difference: number;              // countedCash - expectedCash (0 = parfait)
  billCounts: { [denomination: number]: number }; // Ex: { 10000: 15, 5000: 8, 500: 12 }
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  sealedByPin: boolean;            // Verrouillage de sécurité
  signedAgentName: string;
}
```

### 6.3 Dette Client (`DebtRecord`)
```typescript
export interface DebtRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'partially_paid' | 'paid';
  paidAmount: number;
  notes?: string;
  createdAt: number;
}
```

---

## 7. 🚀 Déploiement & Hébergement Cloud

### 7.1 Dépôt GitHub Officiel
- **URL** : **[https://github.com/nabnazbeats-beep/tivo](https://github.com/nabnazbeats-beep/tivo)**
- **Branche principale** : `main`
- **Fichier `.gitignore`** : Exclut rigoureusement `node_modules/`, `dist/`, `.env` et caches locaux.

### 7.2 Déploiement Permanent en 1 Clic (Vercel)
L'application est 100% compatible avec **Vercel** ou **Netlify** :
1. Connecter le compte GitHub sur [https://vercel.com](https://vercel.com).
2. Importer le dépôt `nabnazbeats-beep/tivo`.
3. Framework Preset : **Vite**.
4. Build Command : `npm run build` (génère le dossier `dist/`).
5. Output Directory : `dist`.
6. L'application est en ligne avec HTTPS, CDN mondial et redirection PWA automatique.

### 7.3 Intégration Backend Supabase
- **Projets configurés** : `tivo-beep's Project` (ref : `lqlqwhwilpexvenvyfoq`).
- **Serveur MCP** : Serveur officiel `@supabase/mcp-server-supabase` configuré dans `mcp_config.json` via Personal Access Token pour l'administration par IA de la base de données, des tables et des Edge Functions.

---

## 8. 💡 Résumé des Commandes Utiles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur local Vite avec HMR (`http://localhost:3000/`) |
| `npm run build` | Compile le projet en TypeScript strict et génère le bundle de production `dist/` |
| `npm run preview` | Prévisualise localement le bundle de production `dist/` |
| `git push origin main` | Pousse instantanément les mises à jour vers GitHub |

---
*Document généré et certifié pour TIVO Platform — Version 2.2 Production.*
