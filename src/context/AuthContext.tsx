import React, { createContext, useContext, useState, useEffect } from 'react';

export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kioskName?: string;
  role: 'gerant' | 'admin' | 'caissier';
  plan: SubscriptionPlan;
  billingCycle?: 'monthly' | 'annual';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, selectedRole?: 'gerant' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    selectedRole?: 'gerant' | 'admin',
    selectedPlan?: SubscriptionPlan,
    extraDetails?: { phone?: string; kioskName?: string; billingCycle?: 'monthly' | 'annual' }
  ) => Promise<{ success: boolean; error?: string }>;
  updatePlan: (newPlan: SubscriptionPlan, billingCycle?: 'monthly' | 'annual') => void;
  quickDemoLogin: (role: 'gerant' | 'admin' | 'caissier', plan?: SubscriptionPlan) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tivo_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tivo_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tivo_auth_user');
    }
  }, [user]);

  const login = async (
    email: string, 
    password: string, 
    selectedRole?: 'gerant' | 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulation réseau ultra-fluide (300ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!email || !password) {
      return { success: false, error: 'Veuillez renseigner tous les champs.' };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Format d’adresse email invalide.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    // Role sélectionné prioritaire, ou déduction par email
    const role: 'admin' | 'gerant' | 'caissier' = selectedRole
      ? selectedRole
      : email.toLowerCase().includes('admin')
      ? 'admin'
      : email.toLowerCase().includes('caissier')
      ? 'caissier'
      : 'gerant';

    const isAdmin = role === 'admin';
    const isCaissier = role === 'caissier';
    
    const loggedUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: isAdmin 
        ? 'Administrateur Tivo' 
        : isCaissier 
        ? 'Fabrice KIKI (Caissier)' 
        : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) || 'Nazirou GBADAMASSI'),
      email,
      role,
      plan: 'pro',
      createdAt: new Date().toISOString(),
    };

    setUser(loggedUser);
    return { success: true };
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    selectedRole?: 'gerant' | 'admin',
    selectedPlan?: SubscriptionPlan,
    extraDetails?: { phone?: string; kioskName?: string; billingCycle?: 'monthly' | 'annual' }
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!name.trim() || !email.trim() || !password) {
      return { success: false, error: 'Tous les champs sont obligatoires.' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Email invalide.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    const role: 'gerant' | 'admin' = selectedRole || 'gerant';
    const plan: SubscriptionPlan = selectedPlan || (role === 'admin' ? 'business' : 'pro');

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.trim(),
      phone: extraDetails?.phone?.trim(),
      kioskName: extraDetails?.kioskName?.trim() || 'Kiosque TIVO',
      role,
      plan,
      billingCycle: extraDetails?.billingCycle || 'annual',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    return { success: true };
  };

  const updatePlan = (newPlan: SubscriptionPlan, billingCycle?: 'monthly' | 'annual') => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plan: newPlan,
        billingCycle: billingCycle || prev.billingCycle || 'annual',
      };
    });
  };

  const quickDemoLogin = (role: 'gerant' | 'admin' | 'caissier', plan?: SubscriptionPlan) => {
    const demoUser: User = role === 'admin'
      ? {
          id: 'admin_demo',
          name: 'Super Admin Tivo',
          email: 'admin@tivo.bj',
          phone: '+229 97 00 11 22',
          kioskName: 'Direction Générale TIVO',
          role: 'admin',
          plan: plan || 'business',
          billingCycle: 'annual',
          createdAt: new Date().toISOString(),
        }
      : role === 'caissier'
      ? {
          id: 'caissier_demo',
          name: 'Fabrice KIKI',
          email: 'fabrice.k@tivo.bj',
          phone: '+229 95 11 22 33',
          kioskName: 'Kiosque Étoile Rouge (Cotonou)',
          role: 'caissier',
          plan: plan || 'pro',
          billingCycle: 'annual',
          createdAt: new Date().toISOString(),
        }
      : {
          id: 'gerant_demo',
          name: 'Nazirou GBADAMASSI',
          email: 'nazirou.g@tivo.bj',
          phone: '+229 96 33 44 55',
          kioskName: 'Kiosque TIVO Dantokpa #1',
          role: 'gerant',
          plan: plan || 'pro',
          billingCycle: 'annual',
          createdAt: new Date().toISOString(),
        };

    setUser(demoUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        updatePlan,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
