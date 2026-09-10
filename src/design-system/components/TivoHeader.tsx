import React from 'react';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface TivoHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

export const TivoHeader: React.FC<TivoHeaderProps> = ({
  title = 'Tivo',
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  children,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-b-[2.5rem] shadow-lg overflow-hidden pt-safe pb-5 px-4 sm:px-6">
      {/* Lueur subtile signature Tivo */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Retour"
              className="p-2 -ml-1 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-tivo.png"
                alt="Logo Tivo"
                className="w-9 h-9 rounded-xl object-contain shadow-md ring-2 ring-white/30"
              />
              <div>
                <span className="text-xl font-bold tracking-tight block leading-tight">Tivo</span>
                <span className="text-[10px] text-blue-100/80 font-medium tracking-wide uppercase">
                  Mobile Money
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right actions: Theme toggle and custom actions */}
        <div className="flex items-center gap-2">
          {rightAction}
          
          <button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="p-2.5 rounded-full glass-pill hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Main Header content */}
      <div className="relative z-10">
        {title && (
          <div className="mt-1">
            {subtitle && (
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block mb-0.5">
                {subtitle}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
