// ============================================================================
// TIVO CURRENCY CONTEXT — PHASE 19
// Gestion des taux de change, marges comptoir & opérations multi-devises
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CurrencyCode, 
  ExchangeRate, 
  ExchangeOperationType, 
  CurrencyExchangeTransaction,
  MarketRatePreset
} from '../currency/currencyTypes';
import { 
  DEFAULT_EXCHANGE_RATES, 
  MARKET_PRESETS_DATA, 
  SUPPORTED_CURRENCIES 
} from '../currency/currencyData';
import { calculateExchange } from '../currency/currencyEngine';
import { useTransactions } from './TransactionContext';
import { useAudit } from './AuditContext';
import { useAgency } from './AgencyContext';
import { formatFCFA } from '../design-system/tokens/typography';

interface ExecuteExchangeParams {
  foreignCurrency: CurrencyCode;
  foreignAmount: number;
  operationType: ExchangeOperationType;
  customRate?: number;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
}

interface CurrencyContextType {
  exchangeRates: Record<CurrencyCode, ExchangeRate>;
  exchangeTransactions: CurrencyExchangeTransaction[];
  todayExchangesCount: number;
  todayExchangeVolumeXof: number;
  todayExchangeGainsXof: number;
  updateCurrencyRate: (code: CurrencyCode, buyRate: number, sellRate: number) => void;
  applyMarketPreset: (preset: MarketRatePreset) => void;
  resetToDefaultRates: () => void;
  executeExchange: (params: ExecuteExchangeParams) => { success: boolean; transaction?: CurrencyExchangeTransaction; error?: string };
  deleteExchangeTransaction: (id: string) => void;
  clearExchangeHistory: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY_RATES = 'tivo_exchange_rates_v1';
const STORAGE_KEY_EXCHANGES = 'tivo_currency_exchanges_v1';

// Historique initial vierge pour la production réelle
const INITIAL_DEMO_EXCHANGES: CurrencyExchangeTransaction[] = [];

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { recordCashMovement } = useTransactions();
  const { addLog } = useAudit();
  const { activeCashier } = useAgency();

  // 1. Taux de change persistants
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, ExchangeRate>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RATES);
      if (saved) {
        return { ...DEFAULT_EXCHANGE_RATES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading stored exchange rates:', e);
    }
    return DEFAULT_EXCHANGE_RATES;
  });

  // 2. Historique des transactions de change
  const [exchangeTransactions, setExchangeTransactions] = useState<CurrencyExchangeTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXCHANGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading stored exchange transactions:', e);
    }
    return INITIAL_DEMO_EXCHANGES;
  });

  // Sauvegarde des taux
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(exchangeRates));
    } catch (e) {
      console.error('Failed to persist exchange rates:', e);
    }
  }, [exchangeRates]);

  // Sauvegarde des transactions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXCHANGES, JSON.stringify(exchangeTransactions));
    } catch (e) {
      console.error('Failed to persist exchange transactions:', e);
    }
  }, [exchangeTransactions]);

  // Statistiques du jour
  const todayExchanges = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return exchangeTransactions.filter((tx) => tx.timestamp.startsWith(todayStr));
  }, [exchangeTransactions]);

  const todayExchangesCount = todayExchanges.length;

  const todayExchangeVolumeXof = useMemo(() => {
    return todayExchanges.reduce((sum, tx) => sum + tx.xofAmount, 0);
  }, [todayExchanges]);

  const todayExchangeGainsXof = useMemo(() => {
    return todayExchanges.reduce((sum, tx) => sum + tx.grossMarginXof, 0);
  }, [todayExchanges]);

  // Mise à jour d'un taux spécifique
  const updateCurrencyRate = useCallback((code: CurrencyCode, buyRate: number, sellRate: number) => {
    setExchangeRates((prev) => {
      const current = prev[code] || DEFAULT_EXCHANGE_RATES[code];
      const spread = sellRate > 0 ? ((sellRate - buyRate) / sellRate) * 100 : 0;
      return {
        ...prev,
        [code]: {
          ...current,
          buyRate,
          sellRate,
          spreadPercent: Math.round(spread * 10) / 10,
          lastUpdated: new Date().toISOString(),
          trend: buyRate > current.buyRate ? 'up' : buyRate < current.buyRate ? 'down' : 'stable',
        },
      };
    });

    addLog({
      category: 'system',
      severity: 'info',
      action: `Mise à jour taux de change ${code}`,
      details: `Achat: ${buyRate} | Vente: ${sellRate}`,
    });
  }, [addLog]);

  // Application d'un preset de marché (Dantokpa, Kraké, Officiel)
  const applyMarketPreset = useCallback((preset: MarketRatePreset) => {
    const presetData = MARKET_PRESETS_DATA[preset];
    if (!presetData) return;

    setExchangeRates((prev) => {
      const nextRates = { ...prev };
      Object.entries(presetData.rates).forEach(([cur, r]) => {
        const cCode = cur as CurrencyCode;
        if (nextRates[cCode] && r) {
          const spread = r.sellRate > 0 ? ((r.sellRate - r.buyRate) / r.sellRate) * 100 : 0;
          nextRates[cCode] = {
            ...nextRates[cCode],
            buyRate: r.buyRate,
            sellRate: r.sellRate,
            spreadPercent: Math.round(spread * 10) / 10,
            lastUpdated: new Date().toISOString(),
          };
        }
      });
      return nextRates;
    });

    addLog({
      category: 'system',
      severity: 'info',
      action: `Barème de change actualisé : ${presetData.name}`,
      details: `Application du preset de cotation ${preset.toUpperCase()}`,
    });
  }, [addLog]);

  // Réinitialisation aux taux par défaut
  const resetToDefaultRates = useCallback(() => {
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
  }, []);

  // Exécution d'une opération de change au guichet
  const executeExchange = useCallback((params: ExecuteExchangeParams): { 
    success: boolean; 
    transaction?: CurrencyExchangeTransaction; 
    error?: string 
  } => {
    if (!params.foreignAmount || params.foreignAmount <= 0) {
      return { success: false, error: 'Montant invalide' };
    }

    const calc = calculateExchange(
      params.foreignCurrency,
      params.foreignAmount,
      params.operationType,
      exchangeRates
    );

    const now = new Date();
    const newTx: CurrencyExchangeTransaction = {
      id: `exch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      timeStr: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      dateStr: "Aujourd'hui",
      operationType: params.operationType,
      foreignCurrency: params.foreignCurrency,
      foreignAmount: params.foreignAmount,
      xofAmount: calc.toAmount,
      rateApplied: calc.effectiveRate,
      grossMarginXof: calc.estimatedGrossMargin,
      clientName: params.clientName?.trim() || undefined,
      clientPhone: params.clientPhone?.trim() || undefined,
      cashierName: activeCashier?.name || 'Nazirou GBADAMASSI',
      notes: params.notes?.trim() || undefined,
    };

    // Synchronisation avec la caisse physique
    const foreignCfg = SUPPORTED_CURRENCIES[params.foreignCurrency];
    if (params.operationType === 'buy') {
      // Le kiosque achète la devise -> décaisse des FCFA
      recordCashMovement({
        type: 'outflow',
        amount: calc.toAmount,
        reason: `Change : Achat ${params.foreignAmount.toLocaleString('fr-FR')} ${foreignCfg.symbol} (${foreignCfg.code})`,
      });
    } else {
      // Le kiosque vend la devise -> encaisse des FCFA
      recordCashMovement({
        type: 'inflow',
        amount: calc.toAmount,
        reason: `Change : Vente ${params.foreignAmount.toLocaleString('fr-FR')} ${foreignCfg.symbol} (${foreignCfg.code})`,
      });
    }

    // Traçabilité Audit Trail immuable
    addLog({
      category: 'cash',
      severity: calc.toAmount >= 500000 ? 'warning' : 'info',
      action: `Opération de Change : ${params.operationType === 'buy' ? 'Achat' : 'Vente'} ${foreignCfg.code}`,
      details: `${params.foreignAmount.toLocaleString('fr-FR')} ${foreignCfg.code} ➔ ${formatFCFA(calc.toAmount)} (Marge estimée: +${formatFCFA(calc.estimatedGrossMargin)})`,
    });

    setExchangeTransactions((prev) => [newTx, ...prev]);

    return { success: true, transaction: newTx };
  }, [exchangeRates, activeCashier, recordCashMovement, addLog]);

  // Supprimer une transaction de l'historique
  const deleteExchangeTransaction = useCallback((id: string) => {
    setExchangeTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  // Vider l'historique
  const clearExchangeHistory = useCallback(() => {
    setExchangeTransactions([]);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        exchangeRates,
        exchangeTransactions,
        todayExchangesCount,
        todayExchangeVolumeXof,
        todayExchangeGainsXof,
        updateCurrencyRate,
        applyMarketPreset,
        resetToDefaultRates,
        executeExchange,
        deleteExchangeTransaction,
        clearExchangeHistory,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
