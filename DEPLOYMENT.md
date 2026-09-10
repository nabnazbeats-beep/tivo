# 🚀 Guide de Déploiement & Architecture de Production — TIVO POS (v2.0)

**Tivo** est une application SaaS / Progressive Web App (PWA) Mobile-First conçue sur mesure pour les gérants de kiosques et points de vente Mobile Money au Bénin et dans la sous-région UEMOA (MTN Mobile Money, Moov Money, Celtis Cash, SMT).

---

## 📋 Récapitulatif des 20 Phases Réalisées avec Succès

| N° | Phase | Description & Modules Clés |
|---|---|---|
| **01** | **Design System & Branding** | Tokens HSL, Squircle officiel, logo Tivo officiel, composants atomiques TivoButton/Card/Field. |
| **02** | **Authentification & Rôles** | Sécurité par code PIN 4 chiffres, bascule multi-opérateurs (Admin, Gérant, Caissier), session chiffrée. |
| **03** | **Dashboard Gérant** | Vue d'ensemble solde trésorerie, cartes rapides, vue masquer/afficher, bascule thème clair/sombre. |
| **04** | **Saisie Rapide (< 5s)** | Pavé tactile haute vitesse, protection contre les découverts de solde, pré-remplissage opérateur. |
| **05** | **Ticket & Confirmation** | Bilan d'impact avant/après sur flotte et caisse physique, génération de ticket thermique et WhatsApp. |
| **06** | **Import Intelligent SMS & OCR** | Parser regex multi-opérateurs (MTN, Moov, Celtis), extraction montant/téléphone/référence, import photo. |
| **07** | **Historique Avancé** | Groupement par date, filtres multi-critères, recherche instantanée, badges d'état et annulation sécurisée. |
| **08** | **Comptabilité & Flux Nets** | Synthèse des flux entrants/sortants par période (jour, semaine, mois, an), marge nette de trésorerie. |
| **09** | **Soldes Réseaux & Flotte UV** | Suivi par opérateur (MTN, Moov, Celtis, SMT), modale d'achat de flotte UV avec impact caisse. |
| **10** | **Caisse Physique & UEMOA** | Calculateur de coupures de billets (10k, 5k, 2k, 1k, 500) et pièces, pointage d'écart caisse. |
| **11** | **Clôture Journalière 🔒** | Assistant pas-à-pas de fin de journée, verrouillage définitif de date, archivage infalsifiable. |
| **12** | **Export Multi-Formats** | Partage WhatsApp formel, export CSV UTF-8 BOM, génération PDF A4 et impression thermique POS 58/80mm. |
| **13** | **Gestion des Créances & Dettes** | Suivi des avances clients, historique des acomptes, alertes d'échéance et relances WhatsApp en 1 clic. |
| **14** | **Offline-First & PWA** | Service Worker v2.0 Stale-While-Revalidate, file d'attente de synchronisation, bannière d'installation PWA. |
| **15** | **Profil d'Agence & Multi-Caissiers** | Fiche IFU, passage de main sécurisé, export/restauration de sauvegarde JSON, réinitialisation usine. |
| **16** | **Calculateur de Commissions UEMOA** | Barèmes officiels MTN/Moov/Celtis/SMT, simulateur de frais clients et gains gérant, devis WhatsApp. |
| **17** | **Journal d'Audit & Anti-Fraude** | Empreintes SHA-256 infalsifiables, surveillance des règles BCEAO/CENTIF LBC/FT (>500k), score 0-100. |
| **18** | **Notifications & Alertes de Seuil** | Bip synthétique Web Audio sans latence, retour haptique, Web Push PWA, dispatch d'urgence WhatsApp. |
| **19** | **Multi-Devises & Frontière** | Guichet de change NGN (Naira), EUR, USD, GHS, GNF, XAF, presets Dantokpa/Kraké/BCEAO, bordereau WhatsApp. |
| **20** | **Optimisations Production** | Découpage de code Rollup, chunks optimisés, manifest PWA enrichi, headers de cache, tests E2E. |

---

## 🛠️ Commandes de Développement & Production

### 1. Lancer le serveur local de développement
```bash
npm run dev
# Serveur disponible sur http://localhost:3000/
```

### 2. Compiler pour la production
```bash
npm run build
# Exécute la vérification TypeScript (tsc) puis le packaging Vite Rollup dans le dossier dist/
```

### 3. Prévisualiser le build de production localement
```bash
npm run preview
```

---

## 🌐 Déploiement Cloud

### Option A : Déploiement sur Firebase Hosting
1. Installer la CLI Firebase :
   ```bash
   npx -y firebase-tools login
   ```
2. Déployer directement :
   ```bash
   npx -y firebase-tools deploy --only hosting
   ```

### Option B : Déploiement sur Vercel
```bash
npx -y vercel --prod
```

### Option C : Déploiement sur Netlify
```bash
npx -y netlify deploy --prod --dir=dist
```

### Option D : Serveur Nginx / Apache / Docker
Pointer la racine du serveur web vers le dossier `dist/` avec redirection de toutes les routes vers `/index.html` (SPA fallback).

---

_Application Tivo développée selon les plus hauts standards de modernité web, d'accessibilité mobile et d'esthétique premium._
