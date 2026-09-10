// ============================================================================
// TIVO CURRENCY DATA & CONFIG — PHASE 19
// Devises Sous-Régionales & Internationales pour Agents Mobile Money
// ============================================================================

import { CurrencyCode, CurrencyConfig, ExchangeRate, MarketRatePreset } from './currencyTypes';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  XOF: {
    code: 'XOF',
    name: 'Franc CFA UEMOA',
    symbol: 'FCFA',
    flag: '🇧🇯',
    country: 'Bénin & UEMOA (8 pays)',
    unitStep: 1,
    description: 'Devise de référence principale du point de vente.',
    popularInBenin: true,
  },
  NGN: {
    code: 'NGN',
    name: 'Naira Nigérian',
    symbol: '₦',
    flag: '🇳🇬',
    country: 'Nigéria',
    unitStep: 1000,
    description: 'Devise n°1 du commerce transfrontalier (Dantokpa, Kraké, Malanville).',
    popularInBenin: true,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    country: 'Union Européenne & Diaspora',
    unitStep: 1,
    description: 'Transferts familiaux et remittances de la diaspora ouest-africaine.',
    popularInBenin: true,
  },
  USD: {
    code: 'USD',
    name: 'Dollar Américain',
    symbol: '$',
    flag: '🇺🇸',
    country: 'États-Unis & International',
    unitStep: 1,
    description: 'Devise reine du commerce international et des importateurs.',
    popularInBenin: true,
  },
  GHS: {
    code: 'GHS',
    name: 'Cedi Ghanéen',
    symbol: 'GH₵',
    flag: '🇬🇭',
    country: 'Ghana',
    unitStep: 10,
    description: 'Couloir commercial Accra - Lomé - Cotonou.',
    popularInBenin: true,
  },
  GNF: {
    code: 'GNF',
    name: 'Franc Guinéen',
    symbol: 'FG',
    flag: '🇬🇳',
    country: 'Guinée (Conakry)',
    unitStep: 10000,
    description: 'Commerce de négoce et diaspora marchande guinéenne à Cotonou.',
    popularInBenin: false,
  },
  XAF: {
    code: 'XAF',
    name: 'Franc CFA CEMAC',
    symbol: 'FCFA',
    flag: '🇨🇲',
    country: 'Cameroun & CEMAC (6 pays)',
    unitStep: 1000,
    description: 'Transferts sous-régionaux Afrique Centrale (parité fixe moins commission).',
    popularInBenin: false,
  },
};

// Grille de taux réalistes au guichet (Achat du kiosque / Vente du kiosque en FCFA)
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, ExchangeRate> = {
  XOF: {
    code: 'XOF',
    buyRate: 1,
    sellRate: 1,
    officialRate: 1,
    spreadPercent: 0,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
  },
  NGN: {
    code: 'NGN',
    buyRate: 0.43, // 1 000 NGN = 430 FCFA
    sellRate: 0.46, // 1 000 NGN = 460 FCFA
    officialRate: 0.445,
    spreadPercent: 6.5,
    lastUpdated: new Date().toISOString(),
    trend: 'up',
  },
  EUR: {
    code: 'EUR',
    buyRate: 650, // Parité officielle 655.957 FCFA
    sellRate: 665,
    officialRate: 655.957,
    spreadPercent: 2.3,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
  },
  USD: {
    code: 'USD',
    buyRate: 595,
    sellRate: 615,
    officialRate: 605,
    spreadPercent: 3.3,
    lastUpdated: new Date().toISOString(),
    trend: 'up',
  },
  GHS: {
    code: 'GHS',
    buyRate: 38.5,
    sellRate: 42.0,
    officialRate: 40.2,
    spreadPercent: 8.3,
    lastUpdated: new Date().toISOString(),
    trend: 'down',
  },
  GNF: {
    code: 'GNF',
    buyRate: 0.068, // 10 000 GNF = 680 FCFA
    sellRate: 0.074, // 10 000 GNF = 740 FCFA
    officialRate: 0.071,
    spreadPercent: 8.1,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
  },
  XAF: {
    code: 'XAF',
    buyRate: 0.97, // 1 000 XAF = 970 FCFA
    sellRate: 1.02, // 1 000 XAF = 1 020 FCFA
    officialRate: 1.0,
    spreadPercent: 4.9,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
  },
};

// Presets de marché pour mise à jour rapide des taux par le gérant
export const MARKET_PRESETS_DATA: Record<MarketRatePreset, { name: string; description: string; rates: Partial<Record<CurrencyCode, { buyRate: number; sellRate: number }>> }> = {
  dantokpa: {
    name: 'Marché Dantokpa (Cotonou)',
    description: 'Taux pratiqués par les bureaux de change informels et cambistes de Dantokpa.',
    rates: {
      NGN: { buyRate: 0.43, sellRate: 0.46 },
      EUR: { buyRate: 650, sellRate: 665 },
      USD: { buyRate: 595, sellRate: 615 },
      GHS: { buyRate: 38.5, sellRate: 42.0 },
      GNF: { buyRate: 0.068, sellRate: 0.074 },
      XAF: { buyRate: 0.97, sellRate: 1.02 },
    },
  },
  krake: {
    name: 'Frontière Kraké / Sémé (Nigéria)',
    description: 'Taux frontière haute volatilité privilégiant la rotation rapide du Naira.',
    rates: {
      NGN: { buyRate: 0.44, sellRate: 0.47 },
      EUR: { buyRate: 648, sellRate: 666 },
      USD: { buyRate: 598, sellRate: 618 },
      GHS: { buyRate: 38.0, sellRate: 42.5 },
      GNF: { buyRate: 0.067, sellRate: 0.075 },
      XAF: { buyRate: 0.965, sellRate: 1.025 },
    },
  },
  official: {
    name: 'Banque Centrale (BCEAO / Référence)',
    description: 'Cours de référence interbancaires avec marge standard de sécurité 1.5%.',
    rates: {
      NGN: { buyRate: 0.438, sellRate: 0.452 },
      EUR: { buyRate: 652, sellRate: 660 },
      USD: { buyRate: 600, sellRate: 610 },
      GHS: { buyRate: 39.5, sellRate: 41.0 },
      GNF: { buyRate: 0.069, sellRate: 0.073 },
      XAF: { buyRate: 0.985, sellRate: 1.015 },
    },
  },
};

// Formateur de devise étrangère avec symbole ou code
export const formatForeignCurrency = (amount: number, code: CurrencyCode): string => {
  const formattedNum = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: code === 'NGN' || code === 'GNF' || code === 'XOF' ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);

  if (code === 'EUR') return `${formattedNum} €`;
  if (code === 'USD') return `$${formattedNum}`;
  if (code === 'NGN') return `₦${formattedNum}`;
  if (code === 'GHS') return `GH₵ ${formattedNum}`;
  if (code === 'GNF') return `${formattedNum} FG`;
  if (code === 'XAF') return `${formattedNum} FCFA`;
  return `${formattedNum} FCFA`;
};
