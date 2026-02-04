import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";

    const variants = {
        primary: "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 border-transparent",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        danger: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && Icon && <Icon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
};
