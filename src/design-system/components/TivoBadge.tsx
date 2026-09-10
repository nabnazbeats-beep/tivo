import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';
import { NetworkConfig, TIVO_NETWORKS } from '../tokens/colors';

export interface TivoBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  isLocked?: boolean;
}

export const TivoBadge: React.FC<TivoBadgeProps> = ({
  children,
  variant = 'info',
  size = 'sm',
  icon,
  isLocked = false,
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {isLocked && <Lock className="w-3 h-3" />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export interface TransactionTypeBadgeProps {
  type: 'deposit' | 'withdrawal';
  size?: 'sm' | 'md';
}

export const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({
  type,
  size = 'sm',
}) => {
  const isDeposit = type === 'deposit';
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-lg font-bold
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}
        ${
          isDeposit
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
        }
      `}
    >
      {isDeposit ? (
        <>
          <ArrowDownLeft className="w-3 h-3" />
          <span>DÉPÔT</span>
        </>
      ) : (
        <>
          <ArrowUpRight className="w-3 h-3" />
          <span>RETRAIT</span>
        </>
      )}
    </span>
  );
};

export interface NetworkChipProps {
  network: NetworkConfig | string;
  selected?: boolean;
  onClick?: () => void;
}

export const NetworkChip: React.FC<NetworkChipProps> = ({
  network,
  selected = false,
  onClick,
}) => {
  const netConfig =
    typeof network === 'string'
      ? TIVO_NETWORKS.find((n) => n.id === network.toLowerCase()) || TIVO_NETWORKS[4]
      : network;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none btn-press border cursor-pointer active:scale-95
        ${
          selected
            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }
      `}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: netConfig.color }}
      />
      <span>{netConfig.name}</span>
    </button>
  );
};
