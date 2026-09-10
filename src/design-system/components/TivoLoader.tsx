import React from 'react';

export interface TivoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

/**
 * Loader Officiel Tivo :
 * Trois petits carrés bleus arrondis qui rebondissent et se déforment en boucle.
 */
export const TivoLoader: React.FC<TivoLoaderProps> = ({
  size = 'md',
  label,
  fullScreen = false,
}) => {
  const squareSizes = {
    sm: 'w-2.5 h-2.5 rounded-[3px]',
    md: 'w-3.5 h-3.5 rounded-[5px]',
    lg: 'w-5 h-5 rounded-[7px]',
  };

  const containerGaps = {
    sm: 'gap-1.5',
    md: 'gap-2.5',
    lg: 'gap-3.5',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`flex items-center justify-center ${containerGaps[size]}`}>
        <div
          className={`${squareSizes[size]} bg-slate-700 dark:bg-slate-300 tivo-square-1`}
        />
        <div
          className={`${squareSizes[size]} bg-blue-600 tivo-square-2`}
        />
        <div
          className={`${squareSizes[size]} bg-blue-800 dark:bg-blue-400 tivo-square-3`}
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};
