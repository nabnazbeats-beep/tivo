// ========================================================
// TIVO - GRILLES TARIFAIRES & COMMISSIONS OPÉRATEURS UEMOA
// Bénin : MTN MoMo, Moov Money Bénin, Celtis Cash (SBIN), SMT
// ========================================================

export interface TariffBracket {
  id: string;
  min: number;
  max: number;
  clientFee: number;
  agentCommission: number;
  label: string;
  notes?: string;
}

export interface FeeCalculationResult {
  networkId: string;
  networkName: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  clientFee: number;
  agentCommission: number;
  agentSharePercent: number;
  totalDebitedFromClient: number;
  cashGivenToClient: number;
  cashCollectedFromClient: number;
  bracket: TariffBracket;
}

// --------------------------------------------------------
// 1. MTN MoMo Bénin
// --------------------------------------------------------
const MTN_DEPOSITS: TariffBracket[] = [
  { id: 'mtn_d_1', min: 100, max: 500, clientFee: 0, agentCommission: 25, label: '100 - 500 FCFA' },
  { id: 'mtn_d_2', min: 501, max: 5000, clientFee: 0, agentCommission: 50, label: '501 - 5 000 FCFA' },
  { id: 'mtn_d_3', min: 5001, max: 25000, clientFee: 0, agentCommission: 100, label: '5 001 - 25 000 FCFA' },
  { id: 'mtn_d_4', min: 25001, max: 50000, clientFee: 0, agentCommission: 175, label: '25 001 - 50 000 FCFA' },
  { id: 'mtn_d_5', min: 50001, max: 100000, clientFee: 0, agentCommission: 300, label: '50 001 - 100 000 FCFA' },
  { id: 'mtn_d_6', min: 100001, max: 250000, clientFee: 0, agentCommission: 450, label: '100 001 - 250 000 FCFA' },
  { id: 'mtn_d_7', min: 250001, max: 500000, clientFee: 0, agentCommission: 800, label: '250 001 - 500 000 FCFA' },
  { id: 'mtn_d_8', min: 500001, max: 1000000, clientFee: 0, agentCommission: 1400, label: '500 001 - 1 000 000 FCFA' },
  { id: 'mtn_d_9', min: 100001, max: 2000000, clientFee: 0, agentCommission: 2200, label: '1 000 001 - 2 000 000 FCFA' },
];

const MTN_WITHDRAWALS: TariffBracket[] = [
  { id: 'mtn_w_1', min: 100, max: 500, clientFee: 50, agentCommission: 25, label: '100 - 500 FCFA' },
  { id: 'mtn_w_2', min: 501, max: 1500, clientFee: 100, agentCommission: 50, label: '501 - 1 500 FCFA' },
  { id: 'mtn_w_3', min: 1501, max: 2500, clientFee: 175, agentCommission: 85, label: '1 501 - 2 500 FCFA' },
  { id: 'mtn_w_4', min: 2501, max: 5000, clientFee: 250, agentCommission: 125, label: '2 501 - 5 000 FCFA' },
  { id: 'mtn_w_5', min: 5001, max: 10000, clientFee: 350, agentCommission: 175, label: '5 001 - 10 000 FCFA' },
  { id: 'mtn_w_6', min: 10001, max: 25000, clientFee: 600, agentCommission: 280, label: '10 001 - 25 000 FCFA' },
  { id: 'mtn_w_7', min: 25001, max: 50000, clientFee: 1000, agentCommission: 460, label: '25 001 - 50 000 FCFA' },
  { id: 'mtn_w_8', min: 50001, max: 100000, clientFee: 1600, agentCommission: 720, label: '50 001 - 100 000 FCFA' },
  { id: 'mtn_w_9', min: 100001, max: 250000, clientFee: 2500, agentCommission: 1100, label: '100 001 - 250 000 FCFA' },
  { id: 'mtn_w_10', min: 250001, max: 500000, clientFee: 3500, agentCommission: 1500, label: '250 001 - 500 000 FCFA' },
  { id: 'mtn_w_11', min: 500001, max: 1000000, clientFee: 5000, agentCommission: 2200, label: '500 001 - 1 000 000 FCFA' },
  { id: 'mtn_w_12', min: 1000001, max: 2000000, clientFee: 8000, agentCommission: 3500, label: '1 000 001 - 2 000 000 FCFA' },
];

// --------------------------------------------------------
// 2. Moov Money Bénin
// --------------------------------------------------------
const MOOV_DEPOSITS: TariffBracket[] = [
  { id: 'moov_d_1', min: 100, max: 5000, clientFee: 0, agentCommission: 40, label: '100 - 5 000 FCFA' },
  { id: 'moov_d_2', min: 5001, max: 25000, clientFee: 0, agentCommission: 90, label: '5 001 - 25 000 FCFA' },
  { id: 'moov_d_3', min: 25001, max: 50000, clientFee: 0, agentCommission: 160, label: '25 001 - 50 000 FCFA' },
  { id: 'moov_d_4', min: 50001, max: 100000, clientFee: 0, agentCommission: 280, label: '50 001 - 100 000 FCFA' },
  { id: 'moov_d_5', min: 100001, max: 250000, clientFee: 0, agentCommission: 420, label: '100 001 - 250 000 FCFA' },
  { id: 'moov_d_6', min: 250001, max: 500000, clientFee: 0, agentCommission: 750, label: '250 001 - 500 000 FCFA' },
  { id: 'moov_d_7', min: 500001, max: 1000000, clientFee: 0, agentCommission: 1300, label: '500 001 - 1 000 000 FCFA' },
  { id: 'moov_d_8', min: 1000001, max: 2000000, clientFee: 0, agentCommission: 2000, label: '1 000 001 - 2 000 000 FCFA' },
];

const MOOV_WITHDRAWALS: TariffBracket[] = [
  { id: 'moov_w_1', min: 100, max: 500, clientFee: 50, agentCommission: 25, label: '100 - 500 FCFA' },
  { id: 'moov_w_2', min: 501, max: 2500, clientFee: 150, agentCommission: 75, label: '501 - 2 500 FCFA' },
  { id: 'moov_w_3', min: 2501, max: 5000, clientFee: 240, agentCommission: 120, label: '2 501 - 5 000 FCFA' },
  { id: 'moov_w_4', min: 5001, max: 10000, clientFee: 330, agentCommission: 165, label: '5 001 - 10 000 FCFA' },
  { id: 'moov_w_5', min: 10001, max: 25000, clientFee: 550, agentCommission: 260, label: '10 001 - 25 000 FCFA' },
  { id: 'moov_w_6', min: 25001, max: 50000, clientFee: 950, agentCommission: 430, label: '25 001 - 50 000 FCFA' },
  { id: 'moov_w_7', min: 50001, max: 100000, clientFee: 1500, agentCommission: 650, label: '50 001 - 100 000 FCFA' },
  { id: 'moov_w_8', min: 100001, max: 250000, clientFee: 2300, agentCommission: 1000, label: '100 001 - 250 000 FCFA' },
  { id: 'moov_w_9', min: 250001, max: 500000, clientFee: 3200, agentCommission: 1400, label: '250 001 - 500 000 FCFA' },
  { id: 'moov_w_10', min: 500001, max: 1000000, clientFee: 4800, agentCommission: 2000, label: '500 001 - 1 000 000 FCFA' },
  { id: 'moov_w_11', min: 1000001, max: 2000000, clientFee: 7500, agentCommission: 3200, label: '1 000 001 - 2 000 000 FCFA' },
];

// --------------------------------------------------------
// 3. Celtis Cash Bénin (SBIN)
// --------------------------------------------------------
const CELTIS_DEPOSITS: TariffBracket[] = [
  { id: 'celtis_d_1', min: 100, max: 10000, clientFee: 0, agentCommission: 50, label: '100 - 10 000 FCFA' },
  { id: 'celtis_d_2', min: 10001, max: 50000, clientFee: 0, agentCommission: 120, label: '10 001 - 50 000 FCFA' },
  { id: 'celtis_d_3', min: 50001, max: 100000, clientFee: 0, agentCommission: 220, label: '50 001 - 100 000 FCFA' },
  { id: 'celtis_d_4', min: 100001, max: 500000, clientFee: 0, agentCommission: 500, label: '100 001 - 500 000 FCFA' },
  { id: 'celtis_d_5', min: 500001, max: 1000000, clientFee: 0, agentCommission: 1000, label: '500 001 - 1 000 000 FCFA' },
  { id: 'celtis_d_6', min: 1000001, max: 2000000, clientFee: 0, agentCommission: 1800, label: '1 000 001 - 2 000 000 FCFA' },
];

const CELTIS_WITHDRAWALS: TariffBracket[] = [
  { id: 'celtis_w_1', min: 100, max: 1000, clientFee: 25, agentCommission: 15, label: '100 - 1 000 FCFA' },
  { id: 'celtis_w_2', min: 1001, max: 5000, clientFee: 120, agentCommission: 65, label: '1 001 - 5 000 FCFA' },
  { id: 'celtis_w_3', min: 5001, max: 15000, clientFee: 220, agentCommission: 115, label: '5 001 - 15 000 FCFA' },
  { id: 'celtis_w_4', min: 15001, max: 50000, clientFee: 450, agentCommission: 225, label: '15 001 - 50 000 FCFA' },
  { id: 'celtis_w_5', min: 50001, max: 100000, clientFee: 800, agentCommission: 400, label: '50 001 - 100 000 FCFA' },
  { id: 'celtis_w_6', min: 100001, max: 250000, clientFee: 1400, agentCommission: 700, label: '100 001 - 250 000 FCFA' },
  { id: 'celtis_w_7', min: 250001, max: 500000, clientFee: 2000, agentCommission: 1000, label: '250 001 - 500 000 FCFA' },
  { id: 'celtis_w_8', min: 500001, max: 1000000, clientFee: 3200, agentCommission: 1500, label: '500 001 - 1 000 000 FCFA' },
  { id: 'celtis_w_9', min: 1000001, max: 2000000, clientFee: 5000, agentCommission: 2300, label: '1 000 001 - 2 000 000 FCFA' },
];

// --------------------------------------------------------
// 4. SMT / Transfert Sous-Régional UEMOA
// --------------------------------------------------------
const SMT_DEPOSITS: TariffBracket[] = [
  { id: 'smt_d_1', min: 1000, max: 25000, clientFee: 350, agentCommission: 150, label: '1 000 - 25 000 FCFA' },
  { id: 'smt_d_2', min: 25001, max: 50000, clientFee: 700, agentCommission: 300, label: '25 001 - 50 000 FCFA' },
  { id: 'smt_d_3', min: 50001, max: 100000, clientFee: 1200, agentCommission: 500, label: '50 001 - 100 000 FCFA' },
  { id: 'smt_d_4', min: 100001, max: 250000, clientFee: 2500, agentCommission: 1000, label: '100 001 - 250 000 FCFA' },
  { id: 'smt_d_5', min: 250001, max: 500000, clientFee: 4500, agentCommission: 1800, label: '250 001 - 500 000 FCFA' },
  { id: 'smt_d_6', min: 500001, max: 1000000, clientFee: 7500, agentCommission: 3000, label: '500 001 - 1 000 000 FCFA' },
  { id: 'smt_d_7', min: 1000001, max: 2000000, clientFee: 12000, agentCommission: 4800, label: '1 000 001 - 2 000 000 FCFA' },
];

const SMT_WITHDRAWALS: TariffBracket[] = [
  { id: 'smt_w_1', min: 1000, max: 50000, clientFee: 500, agentCommission: 250, label: '1 000 - 50 000 FCFA' },
  { id: 'smt_w_2', min: 50001, max: 100000, clientFee: 1000, agentCommission: 500, label: '50 001 - 100 000 FCFA' },
  { id: 'smt_w_3', min: 100001, max: 250000, clientFee: 2000, agentCommission: 900, label: '100 001 - 250 000 FCFA' },
  { id: 'smt_w_4', min: 250001, max: 500000, clientFee: 3500, agentCommission: 1500, label: '250 001 - 500 000 FCFA' },
  { id: 'smt_w_5', min: 500001, max: 1000000, clientFee: 6000, agentCommission: 2500, label: '500 001 - 1 000 000 FCFA' },
  { id: 'smt_w_6', min: 1000001, max: 2000000, clientFee: 10000, agentCommission: 4000, label: '1 000 001 - 2 000 000 FCFA' },
];

// Fallback pour les réseaux secondaires
const OTHER_DEPOSITS: TariffBracket[] = [
  { id: 'oth_d_1', min: 100, max: 2000000, clientFee: 0, agentCommission: 100, label: 'Tous montants' },
];
const OTHER_WITHDRAWALS: TariffBracket[] = [
  { id: 'oth_w_1', min: 100, max: 2000000, clientFee: 300, agentCommission: 150, label: 'Tous montants' },
];

/**
 * Récupérer la grille complète pour un opérateur et un type d'opération
 */
export const getTariffBrackets = (
  networkId: string,
  type: 'deposit' | 'withdrawal'
): TariffBracket[] => {
  const isDeposit = type === 'deposit';

  switch (networkId) {
    case 'mtn':
      return isDeposit ? MTN_DEPOSITS : MTN_WITHDRAWALS;
    case 'moov':
      return isDeposit ? MOOV_DEPOSITS : MOOV_WITHDRAWALS;
    case 'celtis':
      return isDeposit ? CELTIS_DEPOSITS : CELTIS_WITHDRAWALS;
    case 'smt':
      return isDeposit ? SMT_DEPOSITS : SMT_WITHDRAWALS;
    default:
      return isDeposit ? OTHER_DEPOSITS : OTHER_WITHDRAWALS;
  }
};

/**
 * Calculer instantanément les frais client et commissions kiosque
 */
export const calculateFees = (
  networkId: string,
  type: 'deposit' | 'withdrawal',
  amount: number
): FeeCalculationResult => {
  const safeAmount = Math.max(0, amount || 0);
  const brackets = getTariffBrackets(networkId, type);

  // Trouver la tranche correspondante
  let matchedBracket = brackets.find((b) => safeAmount >= b.min && safeAmount <= b.max);

  // Si au-delà du max ou en dessous du min
  if (!matchedBracket && brackets.length > 0) {
    if (safeAmount < brackets[0].min) {
      matchedBracket = brackets[0];
    } else {
      matchedBracket = brackets[brackets.length - 1];
    }
  }

  // Fallback sûr
  const clientFee = matchedBracket ? matchedBracket.clientFee : (type === 'deposit' ? 0 : Math.round(safeAmount * 0.015));
  const agentCommission = matchedBracket ? matchedBracket.agentCommission : Math.round(clientFee * 0.5);

  const agentSharePercent = clientFee > 0 
    ? Math.min(100, Math.round((agentCommission / clientFee) * 100))
    : 100; // Pour un dépôt gratuit, 100% de la commission de l'opérateur revient à l'agent

  // Nom lisible du réseau
  const networkNames: Record<string, string> = {
    mtn: 'MTN MoMo Bénin',
    moov: 'Moov Money Bénin',
    celtis: 'Celtis Cash Bénin',
    smt: 'SMT Transfert UEMOA',
    other: 'Autre Réseau',
  };

  const netName = networkNames[networkId] || networkId.toUpperCase();

  // Flux d'espèces au comptoir
  // Dépôt : Le client donne le montant du dépôt (les frais sont de 0 ou inclus).
  const cashCollectedFromClient = type === 'deposit' ? safeAmount + clientFee : 0;
  // Retrait : L'agent remet les espèces au client. Le compte client est débité de safeAmount + clientFee (ou safeAmount).
  const cashGivenToClient = type === 'withdrawal' ? safeAmount : 0;
  const totalDebitedFromClient = type === 'withdrawal' ? safeAmount + clientFee : safeAmount;

  return {
    networkId,
    networkName: netName,
    type,
    amount: safeAmount,
    clientFee,
    agentCommission,
    agentSharePercent,
    totalDebitedFromClient,
    cashGivenToClient,
    cashCollectedFromClient,
    bracket: matchedBracket || {
      id: 'custom',
      min: safeAmount,
      max: safeAmount,
      clientFee,
      agentCommission,
      label: 'Personnalisé',
    },
  };
};

/**
 * Générer un message formaté pour envoi direct WhatsApp ou SMS au client
 */
export const formatWhatsAppQuote = (res: FeeCalculationResult): string => {
  const isDeposit = res.type === 'deposit';
  const typeStr = isDeposit ? 'Dépôt d’argent (Cash In)' : 'Retrait d’espèces (Cash Out)';

  return `*KIOSQUE MOBILE MONEY - DEVIS TARIFAIRE* 🏦
----------------------------------------
📌 *Opérateur :* ${res.networkName}
📋 *Opération :* ${typeStr}
💰 *Montant :* ${res.amount.toLocaleString('fr-FR')} FCFA
💸 *Frais :* ${res.clientFee === 0 ? 'GRATUIT (0 FCFA)' : `${res.clientFee.toLocaleString('fr-FR')} FCFA`}
----------------------------------------
${isDeposit 
  ? `💵 *Espèces à remettre au guichet :* ${res.cashCollectedFromClient.toLocaleString('fr-FR')} FCFA`
  : `📱 *Total débité de votre compte :* ${res.totalDebitedFromClient.toLocaleString('fr-FR')} FCFA\n💵 *Espèces remises en main propre :* ${res.cashGivenToClient.toLocaleString('fr-FR')} FCFA`
}
----------------------------------------
_Calculé via Tivo Mobile Money Hub_ ✨`;
};
