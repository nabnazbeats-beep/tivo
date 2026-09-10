// ============================================================================
// TIVO CURRENCY ENGINE — PHASE 19
// Moteur de calculs de conversion, marges guichet & bordereaux WhatsApp
// ============================================================================

import { 
  CurrencyCode, 
  ExchangeRate, 
  ExchangeOperationType, 
  ExchangeCalculationResult,
  CurrencyExchangeTransaction
} from './currencyTypes';
import { SUPPORTED_CURRENCIES, formatForeignCurrency } from './currencyData';
import { formatFCFA } from '../design-system/tokens/typography';

/**
 * Calcule la conversion exacte entre devises selon le barème du comptoir
 */
export const calculateExchange = (
  foreignCurrency: CurrencyCode,
  foreignAmount: number,
  operationType: ExchangeOperationType,
  rates: Record<CurrencyCode, ExchangeRate>
): ExchangeCalculationResult => {
  const rateConfig = rates[foreignCurrency] || rates.NGN;
  const currConfig = SUPPORTED_CURRENCIES[foreignCurrency] || SUPPORTED_CURRENCIES.NGN;

  let xofAmount = 0;
  let effectiveRate = 0;
  let estimatedGrossMargin = 0;

  if (operationType === 'buy') {
    // Le kiosque ACHÈTE la devise étrangère au client contre des FCFA
    // Client donne X devises -> reçoit X * buyRate en FCFA
    effectiveRate = rateConfig.buyRate;
    xofAmount = Math.round(foreignAmount * effectiveRate);
    
    // Marge brute estimée basée sur le spread (revente au cours de vente ou officiel)
    const benchmarkSell = rateConfig.sellRate > rateConfig.buyRate ? rateConfig.sellRate : rateConfig.officialRate;
    estimatedGrossMargin = Math.round(foreignAmount * (benchmarkSell - rateConfig.buyRate));
  } else {
    // Le kiosque VEND la devise étrangère au client contre des FCFA
    // Client veut X devises -> doit payer X * sellRate en FCFA
    effectiveRate = rateConfig.sellRate;
    xofAmount = Math.round(foreignAmount * effectiveRate);

    // Marge brute estimée basée sur le spread par rapport au cours d'achat
    const benchmarkBuy = rateConfig.buyRate < rateConfig.sellRate ? rateConfig.buyRate : rateConfig.officialRate;
    estimatedGrossMargin = Math.round(foreignAmount * (rateConfig.sellRate - benchmarkBuy));
  }

  // Affichage du taux unitaire compréhensible par les marchands
  const step = currConfig.unitStep;
  const stepTotal = Math.round(step * effectiveRate);
  const unitRateDisplay = `${step.toLocaleString('fr-FR')} ${foreignCurrency} = ${formatFCFA(stepTotal)}`;

  const marginPercent = Math.max(0, rateConfig.spreadPercent);

  return {
    fromCurrency: operationType === 'buy' ? foreignCurrency : 'XOF',
    toCurrency: operationType === 'buy' ? 'XOF' : foreignCurrency,
    fromAmount: operationType === 'buy' ? foreignAmount : xofAmount,
    toAmount: operationType === 'buy' ? xofAmount : foreignAmount,
    effectiveRate,
    operationType,
    unitRateDisplay,
    estimatedGrossMargin: Math.max(0, estimatedGrossMargin),
    marginPercent,
  };
};

/**
 * Génère le message WhatsApp formel pour le bordereau de change
 */
export const generateWhatsAppExchangeSlip = (
  tx: CurrencyExchangeTransaction,
  agencyName: string = 'Agence Tivo'
): string => {
  const foreignCfg = SUPPORTED_CURRENCIES[tx.foreignCurrency];
  const isBuy = tx.operationType === 'buy';

  const opTitle = isBuy 
    ? `ACHAT DE DEVISES (${foreignCfg.flag} ${tx.foreignCurrency} ➔ 🇧🇯 FCFA)` 
    : `VENTE DE DEVISES (🇧🇯 FCFA ➔ ${foreignCfg.flag} ${tx.foreignCurrency})`;

  const clientLine = tx.clientName 
    ? `*Client :* ${tx.clientName} ${tx.clientPhone ? `(${tx.clientPhone})` : ''}\n` 
    : '';

  const detailsLine = isBuy
    ? `*Devise reçue :* ${formatForeignCurrency(tx.foreignAmount, tx.foreignCurrency)}\n*Espèces remises :* ${formatFCFA(tx.xofAmount)}`
    : `*Espèces encaissées :* ${formatFCFA(tx.xofAmount)}\n*Devise délivrée :* ${formatForeignCurrency(tx.foreignAmount, tx.foreignCurrency)}`;

  const step = foreignCfg.unitStep;
  const rateStepTotal = Math.round(step * tx.rateApplied);
  const rateStr = `${step.toLocaleString('fr-FR')} ${tx.foreignCurrency} = ${formatFCFA(rateStepTotal)}`;

  const textLines = [
    `🧾 *BORDEREAU DE CHANGE — ${agencyName.toUpperCase()}*`,
    `----------------------------------------`,
    `*Opération :* ${opTitle}`,
    `*Réf :* #${tx.id.substring(tx.id.length - 8)}`,
    `*Date & Heure :* ${tx.dateStr} à ${tx.timeStr}`,
    clientLine ? clientLine.trim() : null,
    `----------------------------------------`,
    detailsLine,
    `*Taux appliqué :* ${rateStr}`,
    `*Opérateur comptoir :* ${tx.cashierName}`,
    `----------------------------------------`,
    `_Opération de change au comptoir certifiée par Tivo POS._`,
    `_Merci pour votre confiance !_ 🤝`,
  ].filter(Boolean);

  const fullText = textLines.join('\n');
  return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
};
