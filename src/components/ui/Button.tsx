/**
 * BlockyKids - Button Component
 */

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-semibold rounded-xl cursor-pointer 
    transition-all duration-300 whitespace-nowrap
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:translate-y-[-2px] active:translate-y-0
  `;

    const variantStyles = {
        primary: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md hover:shadow-glow',
        secondary: 'bg-card text-white border border-white/10 hover:bg-card-hover hover:border-primary-light',
        success: 'bg-gradient-to-r from-success to-success-light text-white hover:shadow-[0_0_20px_rgba(0,184,148,0.4)]',
        warning: 'bg-warning text-gray-900',
        danger: 'bg-danger text-white',
        outline: 'bg-transparent text-primary-light border-2 border-primary-light hover:bg-primary hover:text-white',
    };

    const sizeStyles = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="text-lg">{icon}</span>}
            {children}
        </button>
    );
}
