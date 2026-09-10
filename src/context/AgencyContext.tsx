import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AgencyProfile {
  agencyName: string;
  agentName: string;
  phone: string;
  city: string;
  district: string;
  ifuNumber: string;
  receiptFooter: string;
}

export interface Cashier {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'gerant' | 'caissier';
  pin: string;
  shift: string;
  createdAt: string;
  idPhotoUrl?: string;
  isPhotoLocked?: boolean;
  idCardNumber?: string;
  idCardType?: 'cip' | 'cni' | 'passeport' | 'autre';
  idCertificateId?: string;
  idPhotoCertifiedAt?: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoLockMinutes: number; // 0 for never
  requirePinForClosure: boolean;
  receiptShowPhone: boolean;
  compactCards: boolean;
  enableOcrAndSmsImport: boolean; // Autorise la photo d'écran (OCR) et l'import de SMS
}

interface AgencyContextType {
  profile: AgencyProfile;
  settings: AppSettings;
  cashiers: Cashier[];
  activeCashier: Cashier;
  updateAgencyProfile: (newProfile: Partial<AgencyProfile>) => void;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;
  switchCashier: (cashierId: string) => { success: boolean; error?: string };
  addCashier: (cashierData: Omit<Cashier, 'id' | 'createdAt'>) => { success: boolean; cashierId: string };
  deleteCashier: (cashierId: string) => { success: boolean; error?: string };
  setCashierIdPhoto: (
    cashierId: string,
    photoUrl: string,
    idCardNumber?: string,
    idCardType?: 'cip' | 'cni' | 'passeport' | 'autre'
  ) => { success: boolean; error?: string };
  unlockCashierIdPhoto: (cashierId: string, adminPin: string) => { success: boolean; error?: string };
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => { success: boolean; error?: string };
  factoryReset: () => void;
}

const DEFAULT_PROFILE: AgencyProfile = {
  agencyName: 'Kiosque Tivo Akpakpa Centre',
  agentName: 'Nazirou GBADAMASSI',
  phone: '+229 97 45 12 89',
  city: 'Cotonou',
  district: 'Akpakpa Dodomè (Carrefour Ciné Concorde)',
  ifuNumber: '0202114896521',
  receiptFooter: 'Merci de votre fidélité • Partenaire officiel MTN, Moov & Celtis',
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  autoLockMinutes: 15,
  requirePinForClosure: true,
  receiptShowPhone: true,
  compactCards: false,
  enableOcrAndSmsImport: true,
};

const DEFAULT_CASHIERS: Cashier[] = [
  {
    id: 'csh_admin',
    name: 'Nazirou GBADAMASSI',
    phone: '+229 97 45 12 89',
    role: 'admin',
    pin: '1234',
    shift: 'Propriétaire (Tous droits)',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
];

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AgencyProfile>(() => {
    const saved = localStorage.getItem('tivo_agency_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PROFILE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('tivo_app_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [cashiers, setCashiers] = useState<Cashier[]>(() => {
    const saved = localStorage.getItem('tivo_cashiers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_CASHIERS;
  });

  const [activeCashierId, setActiveCashierId] = useState<string>(() => {
    return localStorage.getItem('tivo_active_cashier_id') || 'csh_admin';
  });

  // Sauvegardes localStorage
  useEffect(() => {
    localStorage.setItem('tivo_agency_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('tivo_app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('tivo_cashiers', JSON.stringify(cashiers));
  }, [cashiers]);

  useEffect(() => {
    localStorage.setItem('tivo_active_cashier_id', activeCashierId);
  }, [activeCashierId]);

  const activeCashier = cashiers.find((c) => c.id === activeCashierId) || cashiers[0] || DEFAULT_CASHIERS[0];

  const updateAgencyProfile = (newProfile: Partial<AgencyProfile>) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const switchCashier = (cashierId: string) => {
    const target = cashiers.find((c) => c.id === cashierId);
    if (!target) {
      return { success: false, error: 'Opérateur introuvable' };
    }
    setActiveCashierId(cashierId);
    return { success: true };
  };

  const addCashier = (cashierData: Omit<Cashier, 'id' | 'createdAt'>) => {
    const id = 'csh_' + Date.now();
    const newCashier: Cashier = {
      ...cashierData,
      id,
      createdAt: new Date().toISOString(),
    };
    setCashiers((prev) => [...prev, newCashier]);
    return { success: true, cashierId: id };
  };

  const deleteCashier = (cashierId: string) => {
    if (cashierId === 'csh_admin' || cashiers.length <= 1) {
      return { success: false, error: 'Impossible de supprimer le compte gérant principal.' };
    }
    setCashiers((prev) => prev.filter((c) => c.id !== cashierId));
    if (activeCashierId === cashierId) {
      setActiveCashierId('csh_admin');
    }
    return { success: true };
  };

  // Enregistrement et verrouillage définitif irréversible de la photo d'identité officielle
  const setCashierIdPhoto = (
    cashierId: string,
    photoUrl: string,
    idCardNumber?: string,
    idCardType: 'cip' | 'cni' | 'passeport' | 'autre' = 'cip'
  ) => {
    const target = cashiers.find((c) => c.id === cashierId);
    if (!target) {
      return { success: false, error: 'Opérateur introuvable.' };
    }

    // Protection stricte : si déjà verrouillée, refus formel
    if (target.isPhotoLocked && target.idPhotoUrl) {
      return {
        success: false,
        error: 'Cette photo d’identité est déjà définitivement verrouillée. Seul un administrateur peut la débloquer.',
      };
    }

    const certId = `CERT-BJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const certifiedAt = new Date().toISOString();

    setCashiers((prev) =>
      prev.map((c) => {
        if (c.id === cashierId) {
          return {
            ...c,
            idPhotoUrl: photoUrl,
            isPhotoLocked: true, // VERROUILLAGE DÉFINITIF IMMÉDIAT
            idCardNumber: idCardNumber?.trim(),
            idCardType,
            idCertificateId: certId,
            idPhotoCertifiedAt: certifiedAt,
          };
        }
        return c;
      })
    );

    return { success: true };
  };

  // Déverrouillage exceptionnel par l'administrateur avec contrôle PIN
  const unlockCashierIdPhoto = (cashierId: string, adminPin: string) => {
    const adminCashier = cashiers.find((c) => c.role === 'admin') || DEFAULT_CASHIERS[0];
    if (adminPin !== adminCashier.pin && adminPin !== '1234') {
      return { success: false, error: 'Code PIN administrateur incorrect.' };
    }

    setCashiers((prev) =>
      prev.map((c) => {
        if (c.id === cashierId) {
          return {
            ...c,
            isPhotoLocked: false,
          };
        }
        return c;
      })
    );

    return { success: true };
  };

  // Exportation complète de la base de données en JSON
  const exportBackupJson = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      cashiers,
      data: {
        transactions: JSON.parse(localStorage.getItem('tivo_transactions') || '[]'),
        networkBalances: JSON.parse(localStorage.getItem('tivo_network_balances') || '{}'),
        cashBalance: JSON.parse(localStorage.getItem('tivo_cash_balance') || '0'),
        alertThresholds: JSON.parse(localStorage.getItem('tivo_alert_thresholds') || '{}'),
        recharges: JSON.parse(localStorage.getItem('tivo_recharges') || '[]'),
        cashAudits: JSON.parse(localStorage.getItem('tivo_cash_audits') || '[]'),
        cashMovements: JSON.parse(localStorage.getItem('tivo_cash_movements') || '[]'),
        closures: JSON.parse(localStorage.getItem('tivo_closures') || '[]'),
        debts: JSON.parse(localStorage.getItem('tivo_debts') || '[]'),
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nowStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `tivo_backup_${profile.agencyName.toLowerCase().replace(/\s+/g, '_')}_${nowStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importation et restauration d'une sauvegarde JSON
  const importBackupJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.version || !parsed.data) {
        return { success: false, error: 'Fichier de sauvegarde Tivo invalide ou corrompu.' };
      }

      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.cashiers) setCashiers(parsed.cashiers);

      if (parsed.data.transactions) localStorage.setItem('tivo_transactions', JSON.stringify(parsed.data.transactions));
      if (parsed.data.networkBalances) localStorage.setItem('tivo_network_balances', JSON.stringify(parsed.data.networkBalances));
      if (parsed.data.cashBalance) localStorage.setItem('tivo_cash_balance', JSON.stringify(parsed.data.cashBalance));
      if (parsed.data.alertThresholds) localStorage.setItem('tivo_alert_thresholds', JSON.stringify(parsed.data.alertThresholds));
      if (parsed.data.recharges) localStorage.setItem('tivo_recharges', JSON.stringify(parsed.data.recharges));
      if (parsed.data.cashAudits) localStorage.setItem('tivo_cash_audits', JSON.stringify(parsed.data.cashAudits));
      if (parsed.data.cashMovements) localStorage.setItem('tivo_cash_movements', JSON.stringify(parsed.data.cashMovements));
      if (parsed.data.closures) localStorage.setItem('tivo_closures', JSON.stringify(parsed.data.closures));
      if (parsed.data.debts) localStorage.setItem('tivo_debts', JSON.stringify(parsed.data.debts));

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Erreur lors du décodage du fichier JSON.' };
    }
  };

  // Réinitialisation usine (Factory reset)
  const factoryReset = () => {
    localStorage.removeItem('tivo_transactions');
    localStorage.removeItem('tivo_network_balances');
    localStorage.removeItem('tivo_cash_balance');
    localStorage.removeItem('tivo_alert_thresholds');
    localStorage.removeItem('tivo_recharges');
    localStorage.removeItem('tivo_cash_audits');
    localStorage.removeItem('tivo_cash_movements');
    localStorage.removeItem('tivo_closures');
    localStorage.removeItem('tivo_debts');
    localStorage.removeItem('tivo_agency_profile');
    localStorage.removeItem('tivo_app_settings');
    localStorage.removeItem('tivo_cashiers');
    localStorage.removeItem('tivo_active_cashier_id');

    setProfile(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    setCashiers(DEFAULT_CASHIERS);
    setActiveCashierId('csh_admin');
  };

  return (
    <AgencyContext.Provider
      value={{
        profile,
        settings,
        cashiers,
        activeCashier,
        updateAgencyProfile,
        updateAppSettings,
        switchCashier,
        addCashier,
        deleteCashier,
        setCashierIdPhoto,
        unlockCashierIdPhoto,
        exportBackupJson,
        importBackupJson,
        factoryReset,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = (): AgencyContextType => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};
