import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isDarkMode?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isDarkMode = false, leftIcon, rightIcon, className = '', ...props }, ref) => {
    
    // Clases base
    const baseInputStyles = 'w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2';
    
    // Estilos basados en tema y estado de error
    const themeStyles = isDarkMode 
      ? `bg-neutral-800 text-white placeholder-neutral-500 ${error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700 focus:ring-indigo-500 focus:border-transparent'}`
      : `bg-neutral-50 text-neutral-900 placeholder-neutral-400 ${error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-neutral-200 focus:bg-white focus:ring-indigo-500 focus:border-transparent'}`;

    // Padding adicional si hay íconos
    const iconPadding = `${leftIcon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''}`;

    return (
      <div className="mb-4 w-full">
        {label && (
          <label className={`block mb-1.5 text-sm font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`${baseInputStyles} ${themeStyles} ${iconPadding} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-500 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
