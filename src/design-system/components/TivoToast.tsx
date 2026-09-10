import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const TivoToastItem: React.FC<ToastProps> = ({
  id,
  type,
  message,
  description,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 dark:border-emerald-500/20',
    error: 'border-rose-500/30 dark:border-rose-500/20',
    warning: 'border-amber-500/30 dark:border-amber-500/20',
    info: 'border-blue-500/30 dark:border-blue-500/20',
  };

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-2xl
        bg-white dark:bg-slate-900
        text-slate-900 dark:text-slate-100
        border shadow-xl shadow-slate-900/10
        ${borders[type]}
        transition-all duration-200 transform translate-y-0
        max-w-sm w-full
      `}
    >
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{message}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export const TivoToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-[420px] px-4 pointer-events-none">
      {toasts.map((toast) => (
        <TivoToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
