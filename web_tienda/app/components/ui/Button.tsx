import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDarkMode?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDarkMode = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all transform active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Tamaño
  const sizeStyles = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3.5 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  // Variantes
  const variants = {
    primary: 'bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 border border-transparent shadow-lg',
    secondary: isDarkMode 
      ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700' 
      : 'bg-neutral-900 text-white hover:bg-neutral-800 border border-transparent',
    outline: isDarkMode
      ? 'bg-transparent border border-neutral-700 text-white hover:bg-neutral-800'
      : 'bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-50',
    ghost: isDarkMode
      ? 'bg-transparent text-neutral-300 hover:text-white hover:bg-neutral-800 shadow-none hover:shadow-none'
      : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 shadow-none hover:shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${widthStyle} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </button>
  );
}
