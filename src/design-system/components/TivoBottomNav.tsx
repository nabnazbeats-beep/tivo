import React from 'react';
import { Home, History, Plus, BarChart3, Settings } from 'lucide-react';

export type NavTabId = 'home' | 'history' | 'add' | 'accounting' | 'settings';

export interface TivoBottomNavProps {
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
  onAddClick?: () => void;
}

export const TivoBottomNav: React.FC<TivoBottomNavProps> = ({
  activeTab = 'home',
  onTabChange,
  onAddClick,
}) => {
  const tabs = [
    { id: 'home' as NavTabId, label: 'Accueil', icon: Home },
    { id: 'history' as NavTabId, label: 'Historique', icon: History },
    { id: 'add' as NavTabId, label: 'Nouveau', icon: Plus, isAction: true },
    { id: 'accounting' as NavTabId, label: 'Comptes', icon: BarChart3 },
    { id: 'settings' as NavTabId, label: 'Réglages', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none no-print"
      data-tivo-bottom-nav
      aria-label="Navigation principale"
    >
      <div className="w-full max-w-[672px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pointer-events-auto px-2 pt-1 pb-safe">
        <div className="flex items-center justify-around h-16 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isAction) {
              return (
                <div key={tab.id} className="relative -top-5 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => onAddClick ? onAddClick() : onTabChange?.(tab.id)}
                    aria-label="Nouvelle transaction"
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-700/35 hover:shadow-xl hover:shadow-blue-700/50 hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-white dark:ring-slate-900 cursor-pointer"
                  >
                    <Plus className="w-7 h-7 stroke-[2.5]" />
                  </button>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 mt-1">
                    {tab.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative min-w-0 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform shrink-0 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9.5px] sm:text-[11px] mt-0.5 sm:mt-1 tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
