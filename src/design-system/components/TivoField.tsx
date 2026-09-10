import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface TivoFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export const TivoField: React.FC<TivoFieldProps> = ({
  label,
  leftIcon,
  rightElement,
  error,
  helperText,
  isPassword = false,
  type = 'text',
  className = '',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-0.5 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </span>
        )}

        <input
          type={effectiveType}
          disabled={disabled}
          className={`
            w-full h-12 sm:h-13 text-sm sm:text-base font-medium
            bg-slate-100 dark:bg-slate-800/90
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            rounded-2xl border
            ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}
            focus:outline-none focus:ring-4
            transition-all duration-150
            ${leftIcon ? 'pl-11' : 'pl-4'}
            ${isPassword || rightElement ? 'pr-11' : 'pr-4'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {!isPassword && rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
