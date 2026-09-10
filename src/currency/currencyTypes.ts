// ============================================================================
// TIVO CURRENCY TYPES — PHASE 19
// Support Multi-Devises & Opérations Sous-Régionales (XOF, NGN, GNF, USD, EUR, XAF, GHS)
// ============================================================================

export type CurrencyCode = 'XOF' | 'NGN' | 'EUR' | 'USD' | 'GHS' | 'GNF' | 'XAF';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string; // Emoji drapeau
  country: string;
  unitStep: number; // Unité usuelle de calcul (ex: 1 000 pour NGN et GNF, 1 pour EUR/USD)
  description: string;
  popularInBenin: boolean;
}

export interface ExchangeRate {
  code: CurrencyCode;
  buyRate: number;    // Taux d'achat du kiosque (FCFA payés par unité de devise)
  sellRate: number;   // Taux de vente du kiosque (FCFA exigés par unité de devise)
  officialRate: number; // Taux de référence indicatif (Banque Centrale)
  spreadPercent: number; // Marge brute calculée ((sellRate - buyRate) / sellRate) * 100
  lastUpdated: string; // ISO 8601
  trend: 'up' | 'down' | 'stable';
}

export type ExchangeOperationType = 'buy' | 'sell'; // buy = le kiosque achète la devise étrangère au client contre FCFA | sell = le kiosque vend la devise étrangère au client contre FCFA

export interface ExchangeCalculationResult {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  fromAmount: number;
  toAmount: number;
  effectiveRate: number;
  operationType: ExchangeOperationType;
  unitRateDisplay: string; // Ex: "1 000 NGN = 430 FCFA"
  estimatedGrossMargin: number; // En FCFA
  marginPercent: number;
}

export interface CurrencyExchangeTransaction {
  id: string;
  timestamp: string;
  timeStr: string;
  dateStr: string;
  operationType: ExchangeOperationType;
  foreignCurrency: CurrencyCode;
  foreignAmount: number;
  xofAmount: number;
  rateApplied: number;
  grossMarginXof: number;
  clientName?: string;
  clientPhone?: string;
  cashierName: string;
  notes?: string;
}

export type MarketRatePreset = 'dantokpa' | 'krake' | 'official';
