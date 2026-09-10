import React from 'react';

export interface TivoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  rounded?: 'xl' | '2xl' | '3xl';
  interactive?: boolean;
}

export const TivoCard: React.FC<TivoCardProps> = ({
  children,
  variant = 'default',
  rounded = '2xl',
  interactive = false,
  className = '',
  ...props
}) => {
  const roundedClasses = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const variantClasses = {
    default:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm',
    elevated:
      'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-tivo-md',
    outlined:
      'bg-transparent border border-slate-200 dark:border-slate-800',
    gradient:
      'bg-tivo-gradient text-white shadow-tivo-lg border border-white/20',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-tivo-md active:scale-[0.99]'
    : '';

  return (
    <div
      className={`
        p-4 sm:p-5
        ${roundedClasses[rounded]}
        ${variantClasses[variant]}
        ${interactiveClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
