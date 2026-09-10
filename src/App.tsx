import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { DashboardScreen } from './dashboard/DashboardScreen';
import { NewTransactionScreen, NewTransactionData } from './transactions/NewTransactionScreen';
import { TransactionConfirmationScreen } from './transactions/TransactionConfirmationScreen';
import { ImportTransactionScreen } from './import/ImportTransactionScreen';
import { HistoryScreen } from './transactions/HistoryScreen';
import { AccountingScreen } from './accounting/AccountingScreen';
import { NetworkBalancesScreen } from './networks/NetworkBalancesScreen';
import { CashBalanceScreen } from './cash/CashBalanceScreen';
import { DailyClosureScreen } from './closure/DailyClosureScreen';
import { ExportScreen } from './export/ExportScreen';
import { DebtsScreen } from './debts/DebtsScreen';
import { ProfileScreen } from './profile/ProfileScreen';
import { TariffCalculatorScreen } from './tariffs/TariffCalculatorScreen';
import { AuditSecurityScreen } from './audit/AuditSecurityScreen';
import { NotificationCenterScreen } from './notifications/NotificationCenterScreen';
import { CurrencyExchangeScreen } from './currency/CurrencyExchangeScreen';
import { LandingPage } from './landing/LandingPage';

// Composants du Design System pour la vitrine Phase 1
import { 
  Sparkles, 
  CreditCard, 
  Coins, 
  Phone, 
  Layers, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { TivoHeader } from './design-system/components/TivoHeader';
import { TivoCard } from './design-system/components/TivoCard';
import { TivoButton } from './design-system/components/TivoButton';
import { TivoField } from './design-system/components/TivoField';
import { NetworkChip } from './design-system/components/TivoBadge';
import { TivoLoader } from './design-system/components/TivoLoader';
import { TivoBottomNav, NavTabId } from './design-system/components/TivoBottomNav';
import { PwaInstallBanner } from './design-system/components/PwaInstallBanner';
import { TivoToastContainer, ToastType } from './design-system/components/TivoToast';
import { TIVO_NETWORKS } from './design-system/tokens/colors';
import { formatFCFA, normalizePhoneNumber, sanitizeAmountInput } from './design-system/tokens/typography';
import { useNetwork } from './context/NetworkContext';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isOnline } = useNetwork();
  const prevOnlineRef = React.useRef(isOnline);

  // Mode d'affichage : 'main' (Dashboard) | 'landing' (Vitrine & Tarifs) | 'auth' (Connexion/Inscription) | 'history' (Phase 7) | ...
  const [currentView, setCurrentView] = useState<'main' | 'landing' | 'auth' | 'history' | 'accounting' | 'networks' | 'cash' | 'closure' | 'export' | 'debts' | 'profile' | 'tariffs' | 'audit' | 'notifications' | 'currency' | 'new-transaction' | 'import-sms' | 'confirm-transaction' | 'showcase'>('main');
  const [pendingTransaction, setPendingTransaction] = useState<NewTransactionData | null>(null);
  const [newTxPreset, setNewTxPreset] = useState<{ networkId?: string; type?: 'deposit' | 'withdrawal'; amount?: number } | null>(null);
  const [importInitialTab, setImportInitialTab] = useState<'paste' | 'photo'>('paste');

  // State pour la vitrine interactive
  const [selectedNetwork, setSelectedNetwork] = useState<string>('mtn');
  const [testAmount, setTestAmount] = useState<string>('150000');
  const [testPhone, setTestPhone] = useState<string>('97001122');
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('home');
  const [showFullLoader, setShowFullLoader] = useState<boolean>(false);

  // Toasts state
  const [toasts, setToasts] = useState<
    { id: string; type: ToastType; message: string; description?: string }[]
  >([]);

  const addToast = (type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }]);
  };

  // Toast automatique lors du basculement en ligne / hors-ligne
  React.useEffect(() => {
    if (prevOnlineRef.current !== isOnline) {
      if (isOnline) {
        addToast('success', 'Connexion rétablie ! 🌐', 'Tivo est connecté aux serveurs cloud. Vos données sont synchronisées.');
      } else {
        addToast('warning', 'Mode Hors-Ligne activé 📡', 'Vous travaillez en local. Toutes vos transactions sont sécurisées sur votre appareil.');
      }
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeAmountInput(e.target.value);
    setTestAmount(raw);
  };

  // 1. Passage du formulaire vers l'écran de confirmation (Phase 4/6 → Phase 5)
  const handleProceedToConfirmation = (data: NewTransactionData) => {
    setPendingTransaction(data);
    setCurrentView('confirm-transaction');
  };

  // 2. Confirmation et enregistrement réussis (Phase 5 → Dashboard)
  const handleConfirmationSuccess = () => {
    if (pendingTransaction) {
      const isDeposit = pendingTransaction.type === 'deposit';
      addToast(
        'success',
        `${isDeposit ? 'Dépôt' : 'Retrait'} de ${formatFCFA(pendingTransaction.amount)} validé !`,
        `Opération enregistrée avec succès sur le réseau ${pendingTransaction.networkId.toUpperCase()} pour ${pendingTransaction.clientPhone}. Soldes actualisés.`
      );
    }
    setPendingTransaction(null);
    setCurrentView('main');
  };

  // 1. Si on a basculé vers la vitrine Phase 1
  if (currentView === 'showcase') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060a12] flex justify-center selection:bg-blue-500 selection:text-white">
        <TivoToastContainer toasts={toasts} onClose={removeToast} />

        {showFullLoader && (
          <div onClick={() => setShowFullLoader(false)} className="cursor-pointer">
            <TivoLoader size="lg" label="Traitement sécurisé Tivo en cours..." fullScreen />
          </div>
        )}

        <div className="w-full max-w-[672px] min-h-screen bg-slate-50 dark:bg-[#0A0F1A] border-x border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative pb-nav-safe flex flex-col">
          <TivoHeader
            title="Design System (Phase 1)"
            subtitle="Vitrine des composants & tokens visuels"
            showBack
            onBack={() => setCurrentView('main')}
          />

          <PwaInstallBanner />

          <main className="px-4 sm:px-6 py-4 flex flex-col gap-6">
            <TivoCard variant="elevated" className="overflow-hidden relative">
              <div className="flex items-start gap-4">
                <img
                  src="/logo-tivo.png"
                  alt="Logo Tivo"
                  className="w-16 h-16 rounded-2xl object-contain shadow-lg ring-2 ring-blue-500/30"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tivo Identity</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Design System & composants réutilisables validés.
                  </p>
                  <button
                    onClick={() => setCurrentView('main')}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour à l'écran principal</span>
                  </button>
                </div>
              </div>
            </TivoCard>

            {/* Couleurs */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Palette & Gradient Signature
              </h3>
              <div className="h-14 rounded-2xl bg-tivo-gradient flex items-center justify-between px-4 text-white shadow-tivo-md">
                <span className="font-bold text-sm">Signature Tivo Gradient</span>
                <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-lg">#3B82F6 → #0EA5E9</span>
              </div>
            </section>

            {/* Opérateurs Réseaux */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                Opérateurs Réseaux Mobile Money
              </h3>
              <div className="flex flex-wrap gap-2">
                {TIVO_NETWORKS.map((network) => (
                  <NetworkChip
                    key={network.id}
                    network={network}
                    selected={selectedNetwork === network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                  />
                ))}
              </div>
            </section>

            {/* Typographie FCFA */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-blue-500" />
                Typographie & Formatage Monétaire FCFA
              </h3>
              <TivoCard variant="default">
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-center">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {formatFCFA(testAmount || 0)}
                  </span>
                </div>
              </TivoCard>
            </section>

            {/* Champs */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                Champs de Saisie
              </h3>
              <TivoField
                label="Montant de l'opération"
                value={testAmount}
                onChange={handleAmountChange}
                leftIcon={<Coins className="w-5 h-5 text-blue-500" />}
                rightElement={<span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-500/10 rounded">FCFA</span>}
              />
              <TivoField
                label="Numéro du client"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                leftIcon={<Phone className="w-5 h-5 text-blue-500" />}
                helperText={`Normalisé : ${normalizePhoneNumber(testPhone)}`}
              />
            </section>

            {/* Boutons */}
            <section className="flex flex-col gap-3">
              <TivoButton
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => addToast('success', 'Action principale testée')}
              >
                Bouton Principal Tivo
              </TivoButton>
            </section>

            {/* Loader Officiel Tivo */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Loader Officiel Tivo (3 carrés bleus animés)
              </h3>
              <TivoCard variant="default" className="py-6 flex flex-col items-center justify-center">
                <TivoLoader size="md" label="Chargement signature Tivo..." />
              </TivoCard>
            </section>
          </main>

          <TivoBottomNav
            activeTab={activeNavTab}
            onTabChange={setActiveNavTab}
            onAddClick={() => setCurrentView('new-transaction')}
          />
        </div>
      </div>
    );
  }

  // 2. Si NON connecté -> Landing Page par défaut (ou AuthScreen si expressément sélectionné)
  if (!isAuthenticated) {
    if (currentView === 'auth') {
      return (
        <AuthScreen 
          onAuthSuccess={() => setCurrentView('main')} 
          onBackToLanding={() => setCurrentView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onEnterApp={() => setCurrentView('main')}
        onOpenAuth={() => setCurrentView('auth')}
      />
    );
  }

  // 2.5. Si CONNECTÉ mais l'utilisateur consulte la Landing Page / Offres
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentView('main')}
        onOpenAuth={() => setCurrentView('main')}
      />
    );
  }

  // 3. Écran Nouvelle Transaction (Phase 4)
  if (currentView === 'new-transaction') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <NewTransactionScreen
          onBack={() => {
            setNewTxPreset(null);
            setCurrentView('main');
          }}
          onSubmit={(data) => {
            setNewTxPreset(null);
            handleProceedToConfirmation(data);
          }}
          onOpenImport={(tab = 'paste') => {
            setImportInitialTab(tab);
            setCurrentView('import-sms');
          }}
          preset={newTxPreset}
        />
      </>
    );
  }

  // 4. Écran Import Transaction SMS / Photo OCR (Phase 6)
  if (currentView === 'import-sms') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <ImportTransactionScreen
          onBack={() => setCurrentView('new-transaction')}
          onProceedToConfirmation={handleProceedToConfirmation}
          initialTab={importInitialTab}
        />
      </>
    );
  }

  // 5. Écran Confirmation Plein Écran (Phase 5)
  if (currentView === 'confirm-transaction' && pendingTransaction) {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <TransactionConfirmationScreen
          data={pendingTransaction}
          onBack={() => setCurrentView('new-transaction')}
          onConfirmSuccess={handleConfirmationSuccess}
        />
      </>
    );
  }

  // 6. Écran Historique Complet (Phase 7)
  if (currentView === 'history') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <HistoryScreen
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
        />
      </>
    );
  }

  // 7. Écran Comptabilité (Phase 8)
  if (currentView === 'accounting') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <AccountingScreen
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }}
          onOpenTariffs={() => setCurrentView('tariffs')}
        />
      </>
    );
  }

  // 8. Écran Soldes Réseaux Mobile Money (Phase 9)
  if (currentView === 'networks') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <NetworkBalancesScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 9. Écran Solde d'Espèces & Décompte UEMOA (Phase 10)
  if (currentView === 'cash') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <CashBalanceScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 10. Écran Clôture Journalière (Phase 11)
  if (currentView === 'closure') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <DailyClosureScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
          onOpenCashCalculator={() => setCurrentView('cash')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 11. Écran Export & Partage (Phase 12)
  if (currentView === 'export') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <ExportScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 12. Écran Carnet de Dettes & Avances Clients (Phase 13)
  if (currentView === 'debts') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <DebtsScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') setCurrentView('new-transaction');
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => setCurrentView('new-transaction')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 13. Écran Profil & Paramètres Agence (Phase 15)
  if (currentView === 'profile') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <ProfileScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }}
          onOpenAudit={() => setCurrentView('audit')}
          onOpenNotifications={() => setCurrentView('notifications')}
          onOpenPricing={() => setCurrentView('landing')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 14. Écran Calculateur de Commissions & Grille Tarifaire UEMOA (Phase 16)
  if (currentView === 'tariffs') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <TariffCalculatorScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={(preset) => {
            if (preset) {
              setNewTxPreset(preset);
            } else {
              setNewTxPreset(null);
            }
            setCurrentView('new-transaction');
          }}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 15. Écran Audit Trail, Sécurité & Détection de Fraude (Phase 17)
  if (currentView === 'audit') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <AuditSecurityScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 16. Écran Centre de Notifications, Alertes Push & Seuils (Phase 18)
  if (currentView === 'notifications') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <NotificationCenterScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }}
          onOpenNetworks={() => setCurrentView('networks')}
          onOpenCash={() => setCurrentView('cash')}
          onOpenClosure={() => setCurrentView('closure')}
          onOpenDebts={() => setCurrentView('debts')}
          onOpenAudit={() => setCurrentView('audit')}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 17. Écran Guichet de Change & Multi-Devises (Phase 19)
  if (currentView === 'currency') {
    return (
      <>
        <TivoToastContainer toasts={toasts} onClose={removeToast} />
        <CurrencyExchangeScreen
          onBack={() => setCurrentView('main')}
          onNavigateTab={(tab) => {
            if (tab === 'home') setCurrentView('main');
            else if (tab === 'history') setCurrentView('history');
            else if (tab === 'add') {
              setNewTxPreset(null);
              setCurrentView('new-transaction');
            }
            else if (tab === 'accounting') setCurrentView('accounting');
            else if (tab === 'settings') setCurrentView('profile');
          }}
          onNewTransaction={() => {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }}
          onShowToast={(type, title, desc) => addToast(type, title, desc)}
        />
      </>
    );
  }

  // 18. Écran principal CONNECTÉ -> Dashboard Gérant (Phase 3)
  return (
    <>
      <TivoToastContainer toasts={toasts} onClose={removeToast} />
      <DashboardScreen
        onNewTransaction={() => {
          setNewTxPreset(null);
          setCurrentView('new-transaction');
        }}
        onViewAllTransactions={() => setCurrentView('history')}
        onOpenNetworks={() => setCurrentView('networks')}
        onOpenCash={() => setCurrentView('cash')}
        onOpenClosure={() => setCurrentView('closure')}
        onOpenExport={() => setCurrentView('export')}
        onOpenDebts={() => setCurrentView('debts')}
        onOpenProfile={() => setCurrentView('profile')}
        onOpenTariffs={() => setCurrentView('tariffs')}
        onOpenAudit={() => setCurrentView('audit')}
        onOpenNotifications={() => setCurrentView('notifications')}
        onOpenCurrency={() => setCurrentView('currency')}
        onNavigateTab={(tab) => {
          if (tab === 'history') setCurrentView('history');
          else if (tab === 'accounting') setCurrentView('accounting');
          else if (tab === 'add') {
            setNewTxPreset(null);
            setCurrentView('new-transaction');
          }
          else if (tab === 'settings') setCurrentView('profile');
        }}
        onOpenShowcase={() => setCurrentView('showcase')}
        onShowToast={(type, title, desc) => addToast(type, title, desc)}
      />
    </>
  );
};
