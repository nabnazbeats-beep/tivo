import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetwork } from './NetworkContext';
import { calculateFees } from '../tariffs/tariffData';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  networkId: string;
  amount: number;
  clientPhone: string;
  clientName?: string;
  timestamp: string; // ISO string
  timeStr: string;   // '14:35'
  dateStr: string;   // 'Aujourd\'hui' ou '09/09/2026'
  isLocked: boolean;
  source: 'manual' | 'sms' | 'photo';
  isSynced?: boolean;
  estimatedFee?: number;
  estimatedCommission?: number;
}

export interface NetworkRecharge {
  id: string;
  networkId: string;
  amount: number;
  paymentMethod: 'cash' | 'external';
  note?: string;
  timestamp: string; // ISO string
  timeStr: string;   // '10:30'
  dateStr: string;   // 'Aujourd\'hui'
}

export interface CashAudit {
  id: string;
  timestamp: string; // ISO string
  timeStr: string;   // '08:00'
  dateStr: string;   // 'Aujourd\'hui'
  theoreticalBalance: number;
  physicalBalance: number;
  discrepancy: number; // physical - theoretical
  reason?: string;
  breakdown: Record<number, number>; // denomination -> count
}

export interface CashMovement {
  id: string;
  type: 'inflow' | 'outflow'; // Apport de fond (+) vs Prélèvement/Dépense caisse (-)
  amount: number;
  reason: string;
  timestamp: string;
  timeStr: string;
  dateStr: string;
}

export interface DailyClosure {
  id: string;
  dateStr: string;
  closedAt: string; // ISO string
  closedAtTime: string; // '20:15'
  closedBy: string; // 'Nazirou GBADAMASSI'
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  transactionCount: number;
  netVariation: number;
  networkBalances: Record<string, number>;
  totalMobileMoney: number;
  cashBalance: number;
  totalTreasury: number;
  cashDiscrepancy: number;
  notes?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  note?: string;
}

export interface DebtRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  networkId?: string;
  dueDate?: string;
  createdAt: string;
  dateStr: string;
  timeStr: string;
  notes?: string;
  payments: DebtPayment[];
}

export interface NetworkBalance {
  networkId: string;
  balance: number;
  alertThreshold: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  networkBalances: Record<string, number>;
  cashBalance: number;
  totalMobileMoneyBalance: number;
  alertThresholds: Record<string, number>;
  recharges: NetworkRecharge[];
  cashAudits: CashAudit[];
  cashMovements: CashMovement[];
  closures: DailyClosure[];
  debts: DebtRecord[];
  totalDebtsAmount: number;
  isTodayClosed: boolean;
  todaySummary: {
    totalDeposits: number;
    totalWithdrawals: number;
    depositCount: number;
    withdrawalCount: number;
    transactionCount: number;
    netVariation: number;
  };
  estimatedDailyCommissions: number;
  estimatedMonthlyCommissions: number;
  addTransaction: (
    tx: Omit<Transaction, 'id' | 'timestamp' | 'timeStr' | 'dateStr' | 'isLocked'>
  ) => { success: boolean; error?: string; transaction?: Transaction };
  addNetworkRecharge: (recharge: {
    networkId: string;
    amount: number;
    paymentMethod: 'cash' | 'external';
    note?: string;
  }) => { success: boolean; error?: string };
  recordCashAudit: (audit: {
    theoreticalBalance: number;
    physicalBalance: number;
    discrepancy: number;
    reason?: string;
    breakdown: Record<number, number>;
  }) => void;
  recordCashMovement: (movement: {
    type: 'inflow' | 'outflow';
    amount: number;
    reason: string;
  }) => { success: boolean; error?: string };
  addDebt: (debt: {
    clientName: string;
    clientPhone: string;
    amount: number;
    networkId?: string;
    dueDate?: string;
    notes?: string;
  }) => { success: boolean; debtId: string };
  recordDebtRepayment: (debtId: string, amount: number, note?: string) => { success: boolean; error?: string };
  deleteDebt: (debtId: string) => void;
  closeDay: (notes?: string, closedBy?: string) => { success: boolean; closureId: string };
  reopenDay: () => void;
  updateAlertThreshold: (networkId: string, threshold: number) => void;
  updateCashBalance: (newBalance: number) => void;
  resetToDemoData: () => void;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Purge automatique de migration vers la production réelle (efface tout résidu fictif ou de test en localStorage)
const PROD_CLEAN_KEY = 'tivo_production_clean_v6';
if (typeof window !== 'undefined' && localStorage.getItem(PROD_CLEAN_KEY) !== 'clean') {
  localStorage.removeItem('tivo_transactions');
  localStorage.removeItem('tivo_network_balances');
  localStorage.removeItem('tivo_cash_balance');
  localStorage.removeItem('tivo_recharges');
  localStorage.removeItem('tivo_cash_audits');
  localStorage.removeItem('tivo_cash_movements');
  localStorage.removeItem('tivo_closures');
  localStorage.removeItem('tivo_debts');
  localStorage.removeItem('tivo_currency_exchanges_v1');
  localStorage.removeItem('tivo_notifications_v1');
  localStorage.removeItem('tivo_audit_logs');
  localStorage.removeItem('tivo_cashiers');
  localStorage.removeItem('tivo_sync_queue');
  localStorage.removeItem('tivo_simulated_offline');
  localStorage.setItem(PROD_CLEAN_KEY, 'clean');
}

// Données initiales vierges prêtes pour la production réelle
const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_NETWORK_BALANCES: Record<string, number> = {
  mtn: 0,
  moov: 0,
  celtis: 0,
  smt: 0,
  other: 0,
};

const INITIAL_ALERT_THRESHOLDS: Record<string, number> = {
  mtn: 50000,
  moov: 50000,
  celtis: 30000,
  smt: 25000,
  other: 20000,
};

const INITIAL_RECHARGES: NetworkRecharge[] = [];

const INITIAL_CASH_BALANCE = 0; // 0 FCFA au démarrage, prêt pour premier apport caisse

const INITIAL_CASH_AUDITS: CashAudit[] = [];

const INITIAL_CASH_MOVEMENTS: CashMovement[] = [];

const INITIAL_CLOSURES: DailyClosure[] = [];

const INITIAL_DEBTS: DebtRecord[] = [];

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, addToSyncQueue } = useNetwork();

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tivo_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Dès que le réseau est actif, marquer les transactions comme synchronisées
  useEffect(() => {
    if (isOnline) {
      setTransactions((prev) =>
        prev.map((t) => (t.isSynced === false ? { ...t, isSynced: true } : t))
      );
    }
  }, [isOnline]);

  const [networkBalances, setNetworkBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('tivo_network_balances');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_NETWORK_BALANCES;
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('tivo_cash_balance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CASH_BALANCE;
  });

  const [alertThresholds, setAlertThresholds] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('tivo_alert_thresholds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ALERT_THRESHOLDS;
  });

  const [recharges, setRecharges] = useState<NetworkRecharge[]>(() => {
    const saved = localStorage.getItem('tivo_recharges');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_RECHARGES;
  });

  const [cashAudits, setCashAudits] = useState<CashAudit[]>(() => {
    const saved = localStorage.getItem('tivo_cash_audits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CASH_AUDITS;
  });

  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() => {
    const saved = localStorage.getItem('tivo_cash_movements');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CASH_MOVEMENTS;
  });

  const [closures, setClosures] = useState<DailyClosure[]>(() => {
    const saved = localStorage.getItem('tivo_closures');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CLOSURES;
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('tivo_debts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_DEBTS;
  });

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem('tivo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tivo_network_balances', JSON.stringify(networkBalances));
  }, [networkBalances]);

  useEffect(() => {
    localStorage.setItem('tivo_cash_balance', JSON.stringify(cashBalance));
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem('tivo_alert_thresholds', JSON.stringify(alertThresholds));
  }, [alertThresholds]);

  useEffect(() => {
    localStorage.setItem('tivo_recharges', JSON.stringify(recharges));
  }, [recharges]);

  useEffect(() => {
    localStorage.setItem('tivo_cash_audits', JSON.stringify(cashAudits));
  }, [cashAudits]);

  useEffect(() => {
    localStorage.setItem('tivo_cash_movements', JSON.stringify(cashMovements));
  }, [cashMovements]);

  useEffect(() => {
    localStorage.setItem('tivo_closures', JSON.stringify(closures));
  }, [closures]);

  useEffect(() => {
    localStorage.setItem('tivo_debts', JSON.stringify(debts));
  }, [debts]);

  // Solde total Mobile Money (somme de tous les comptes réseaux)
  const totalMobileMoneyBalance = Object.values(networkBalances).reduce((acc, curr) => acc + curr, 0);

  // Total des dettes en cours (montant restant dû)
  const totalDebtsAmount = debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // Calcul du résumé de la journée
  const todaySummary = React.useMemo(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'deposit') {
        totalDeposits += tx.amount;
        depositCount++;
      } else {
        totalWithdrawals += tx.amount;
        withdrawalCount++;
      }
    });

    return {
      totalDeposits,
      totalWithdrawals,
      depositCount,
      withdrawalCount,
      transactionCount: transactions.length,
      netVariation: totalDeposits - totalWithdrawals,
    };
  }, [transactions]);

  // Commissions estimées de la journée
  const estimatedDailyCommissions = React.useMemo(() => {
    return transactions.reduce((sum, tx) => {
      const comm = tx.estimatedCommission ?? calculateFees(tx.networkId, tx.type, tx.amount).agentCommission;
      return sum + comm;
    }, 0);
  }, [transactions]);

  // Projection mensuelle estimée
  const estimatedMonthlyCommissions = React.useMemo(() => {
    return estimatedDailyCommissions * 26; // approx 26 jours ouvrés par mois
  }, [estimatedDailyCommissions]);

  // Ajout d'une transaction
  const addTransaction = (
    newTxData: Omit<Transaction, 'id' | 'timestamp' | 'timeStr' | 'dateStr' | 'isLocked'>
  ) => {
    const { type, networkId, amount } = newTxData;
    const currentNetBal = networkBalances[networkId] || 0;

    // Blocage si retrait supérieur au solde du réseau
    if (type === 'withdrawal' && amount > currentNetBal) {
      return {
        success: false,
        error: `Solde insuffisant sur le réseau. Solde disponible : ${currentNetBal.toLocaleString()} FCFA`,
      };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Calcul automatique des frais et de la commission si non spécifiés
    const fees = calculateFees(networkId, type, amount);

    const createdTx: Transaction = {
      ...newTxData,
      id: 'tx_' + Date.now(),
      timestamp: now.toISOString(),
      timeStr: `${hours}:${minutes}`,
      dateStr: "Aujourd'hui",
      isLocked: false,
      isSynced: isOnline,
      estimatedFee: newTxData.estimatedFee ?? fees.clientFee,
      estimatedCommission: newTxData.estimatedCommission ?? fees.agentCommission,
    };

    // 1. Mettre à jour la liste des transactions
    setTransactions((prev) => [createdTx, ...prev]);

    // Enregistrement dans la file de synchronisation si hors-ligne
    if (!isOnline) {
      addToSyncQueue({
        type: 'transaction',
        action: 'Nouvelle transaction',
        summary: `${type === 'deposit' ? 'Dépôt' : 'Retrait'} ${amount.toLocaleString()} FCFA (${networkId.toUpperCase()})`,
        data: createdTx,
      });
    }

    // 2. Mettre à jour les soldes réseaux et espèces
    // - Dépôt : Le gérant ENVOIE de la monnaie électronique (son solde réseau DIMINUE), et il REÇOIT des espèces du client (son solde espèces AUGMENTE).
    // - Retrait : Le gérant REÇOIT de la monnaie électronique (son solde réseau AUGMENTE), et il DONNE des espèces au client (son solde espèces DIMINUE).
    setNetworkBalances((prev) => {
      const current = prev[networkId] || 0;
      const updated = type === 'deposit' ? current - amount : current + amount;
      return { ...prev, [networkId]: updated };
    });

    setCashBalance((prev) => {
      return type === 'deposit' ? prev + amount : prev - amount;
    });

    return { success: true, transaction: createdTx };
  };

  const addNetworkRecharge = ({
    networkId,
    amount,
    paymentMethod,
    note,
  }: {
    networkId: string;
    amount: number;
    paymentMethod: 'cash' | 'external';
    note?: string;
  }) => {
    if (amount <= 0) {
      return { success: false, error: 'Le montant de recharge doit être supérieur à 0 FCFA' };
    }

    if (paymentMethod === 'cash' && amount > cashBalance) {
      return {
        success: false,
        error: `Espèces insuffisantes en caisse pour cette recharge (${cashBalance.toLocaleString()} FCFA disponible)`,
      };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const createdRecharge: NetworkRecharge = {
      id: 'rec_' + Date.now(),
      networkId,
      amount,
      paymentMethod,
      note: note || 'Achat de flotte / UV',
      timestamp: now.toISOString(),
      timeStr: `${hours}:${minutes}`,
      dateStr: "Aujourd'hui",
    };

    // 1. Ajouter à l'historique des recharges
    setRecharges((prev) => [createdRecharge, ...prev]);

    // 2. Augmenter le solde du réseau opérateur
    setNetworkBalances((prev) => {
      const current = prev[networkId] || 0;
      return { ...prev, [networkId]: current + amount };
    });

    // 3. Déduire du tiroir caisse si payé en espèces
    if (paymentMethod === 'cash') {
      setCashBalance((prev) => Math.max(0, prev - amount));
    }

    if (!isOnline) {
      addToSyncQueue({
        type: 'recharge',
        action: 'Recharge flotte',
        summary: `Recharge ${networkId.toUpperCase()} de ${amount.toLocaleString()} FCFA (${paymentMethod})`,
      });
    }

    return { success: true };
  };

  const recordCashAudit = (auditData: {
    theoreticalBalance: number;
    physicalBalance: number;
    discrepancy: number;
    reason?: string;
    breakdown: Record<number, number>;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const newAudit: CashAudit = {
      ...auditData,
      id: 'audit_' + Date.now(),
      timestamp: now.toISOString(),
      timeStr: `${hours}:${minutes}`,
      dateStr: "Aujourd'hui",
    };

    setCashAudits((prev) => [newAudit, ...prev]);
    // Synchronisation immédiate du solde d'espèces avec le comptage physique
    setCashBalance(auditData.physicalBalance);
  };

  const recordCashMovement = ({
    type,
    amount,
    reason,
  }: {
    type: 'inflow' | 'outflow';
    amount: number;
    reason: string;
  }) => {
    if (amount <= 0) {
      return { success: false, error: 'Le montant doit être supérieur à 0 FCFA' };
    }
    if (type === 'outflow' && amount > cashBalance) {
      return {
        success: false,
        error: `Montant supérieur aux espèces disponibles en caisse (${cashBalance.toLocaleString()} FCFA dispo)`,
      };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const newMovement: CashMovement = {
      id: 'mov_' + Date.now(),
      type,
      amount,
      reason: reason.trim() || (type === 'inflow' ? 'Apport de fonds' : 'Prélèvement de caisse'),
      timestamp: now.toISOString(),
      timeStr: `${hours}:${minutes}`,
      dateStr: "Aujourd'hui",
    };

    setCashMovements((prev) => [newMovement, ...prev]);
    setCashBalance((prev) => (type === 'inflow' ? prev + amount : Math.max(0, prev - amount)));

    if (!isOnline) {
      addToSyncQueue({
        type: 'cash_movement',
        action: type === 'inflow' ? 'Apport de fonds' : 'Prélèvement de caisse',
        summary: `${type === 'inflow' ? '+' : '-'}${amount.toLocaleString()} FCFA (${reason || 'Mouvement'})`,
      });
    }

    return { success: true };
  };

  const addDebt = ({
    clientName,
    clientPhone,
    amount,
    networkId,
    dueDate,
    notes,
  }: {
    clientName: string;
    clientPhone: string;
    amount: number;
    networkId?: string;
    dueDate?: string;
    notes?: string;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const debtId = 'debt_' + Date.now();

    const newDebt: DebtRecord = {
      id: debtId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      status: 'unpaid',
      networkId: networkId || 'mtn',
      dueDate,
      createdAt: now.toISOString(),
      dateStr: "Aujourd'hui",
      timeStr: `${hours}:${minutes}`,
      notes: notes?.trim(),
      payments: [],
    };

    setDebts((prev) => [newDebt, ...prev]);

    if (!isOnline) {
      addToSyncQueue({
        type: 'debt',
        action: 'Nouvelle avance',
        summary: `Avance ${amount.toLocaleString()} FCFA pour ${clientName}`,
      });
    }

    return { success: true, debtId };
  };

  const recordDebtRepayment = (debtId: string, amount: number, note?: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) {
      return { success: false, error: 'Dette introuvable' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Le montant du remboursement doit être supérieur à 0' };
    }
    if (amount > debt.remainingAmount) {
      return {
        success: false,
        error: `Montant supérieur au reste dû (${debt.remainingAmount.toLocaleString()} FCFA)`,
      };
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const payment: DebtPayment = {
      id: 'pay_' + Date.now(),
      amount,
      timestamp: now.toISOString(),
      dateStr: "Aujourd'hui",
      timeStr: `${hours}:${minutes}`,
      note: note || 'Remboursement espèces',
    };

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newPaid = d.paidAmount + amount;
        const newRemaining = d.remainingAmount - amount;
        const newStatus: 'unpaid' | 'partial' | 'paid' = newRemaining <= 0 ? 'paid' : 'partial';
        return {
          ...d,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          payments: [payment, ...d.payments],
        };
      })
    );

    // L'argent remboursé par le client rentre directement dans la caisse espèces physique
    setCashBalance((prev) => prev + amount);

    if (!isOnline) {
      addToSyncQueue({
        type: 'debt',
        action: 'Remboursement avance',
        summary: `Règlement ${amount.toLocaleString()} FCFA de ${debt.clientName}`,
      });
    }

    return { success: true };
  };

  const deleteDebt = (debtId: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== debtId));
  };

  const isTodayClosed = closures.some(
    (c) => c.dateStr === "Aujourd'hui"
  );

  const closeDay = (notes?: string, closedBy?: string) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const closureId = 'close_' + Date.now();

    // 1. Verrouiller TOUTES les transactions de la journée
    setTransactions((prev) =>
      prev.map((tx) => ({
        ...tx,
        isLocked: true,
      }))
    );

    // 2. Dernier écart de caisse constaté
    const lastDiscrepancy = cashAudits.length > 0 ? cashAudits[0].discrepancy : 0;

    const newClosure: DailyClosure = {
      id: closureId,
      dateStr: "Aujourd'hui",
      closedAt: now.toISOString(),
      closedAtTime: `${hours}:${minutes}`,
      closedBy: closedBy || 'Nazirou GBADAMASSI',
      totalDeposits: todaySummary.totalDeposits,
      totalWithdrawals: todaySummary.totalWithdrawals,
      depositCount: todaySummary.depositCount,
      withdrawalCount: todaySummary.withdrawalCount,
      transactionCount: todaySummary.transactionCount,
      netVariation: todaySummary.netVariation,
      networkBalances: { ...networkBalances },
      totalMobileMoney: totalMobileMoneyBalance,
      cashBalance,
      totalTreasury: totalMobileMoneyBalance + cashBalance,
      cashDiscrepancy: lastDiscrepancy,
      notes: notes || 'Clôture journalière effectuée avec succès',
    };

    setClosures((prev) => [newClosure, ...prev]);
    return { success: true, closureId };
  };

  const reopenDay = () => {
    // Déverrouiller les transactions
    setTransactions((prev) =>
      prev.map((tx, idx) => ({
        ...tx,
        isLocked: idx === prev.length - 1, // Garde juste la plus ancienne verrouillée
      }))
    );
    // Retirer la clôture d'aujourd'hui
    setClosures((prev) => prev.filter((c) => c.dateStr !== "Aujourd'hui"));
  };

  const updateAlertThreshold = (networkId: string, threshold: number) => {
    setAlertThresholds((prev) => ({
      ...prev,
      [networkId]: Math.max(0, threshold),
    }));
  };

  const updateCashBalance = (newBalance: number) => {
    setCashBalance(newBalance);
  };

  const resetToDemoData = () => {
    localStorage.removeItem('tivo_transactions');
    localStorage.removeItem('tivo_network_balances');
    localStorage.removeItem('tivo_cash_balance');
    localStorage.removeItem('tivo_recharges');
    localStorage.removeItem('tivo_cash_audits');
    localStorage.removeItem('tivo_cash_movements');
    localStorage.removeItem('tivo_closures');
    localStorage.removeItem('tivo_debts');
    localStorage.removeItem('tivo_sync_queue');
    setTransactions(INITIAL_TRANSACTIONS);
    setNetworkBalances(INITIAL_NETWORK_BALANCES);
    setCashBalance(INITIAL_CASH_BALANCE);
    setAlertThresholds(INITIAL_ALERT_THRESHOLDS);
    setRecharges(INITIAL_RECHARGES);
    setCashAudits(INITIAL_CASH_AUDITS);
    setCashMovements(INITIAL_CASH_MOVEMENTS);
    setClosures(INITIAL_CLOSURES);
    setDebts(INITIAL_DEBTS);
  };

  const clearTransactions = () => {
    localStorage.removeItem('tivo_transactions');
    localStorage.removeItem('tivo_recharges');
    localStorage.removeItem('tivo_cash_audits');
    localStorage.removeItem('tivo_cash_movements');
    localStorage.removeItem('tivo_closures');
    localStorage.removeItem('tivo_debts');
    localStorage.removeItem('tivo_cash_balance');
    localStorage.removeItem('tivo_sync_queue');
    setTransactions([]);
    setRecharges([]);
    setCashAudits([]);
    setCashMovements([]);
    setClosures([]);
    setDebts([]);
    setCashBalance(0);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        networkBalances,
        cashBalance,
        totalMobileMoneyBalance,
        alertThresholds,
        recharges,
        cashAudits,
        cashMovements,
        closures,
        debts,
        totalDebtsAmount,
        isTodayClosed,
        todaySummary,
        estimatedDailyCommissions,
        estimatedMonthlyCommissions,
        addTransaction,
        addNetworkRecharge,
        recordCashAudit,
        recordCashMovement,
        addDebt,
        recordDebtRepayment,
        deleteDebt,
        closeDay,
        reopenDay,
        updateAlertThreshold,
        updateCashBalance,
        resetToDemoData,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
