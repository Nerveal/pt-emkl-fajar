import React, { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

        const variants = {
            primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20",
            secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/5",
            danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
            ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
        };

        const sizes = "px-6 py-2.5 text-sm"; // Can extend to multiple sizes if needed

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
                ) : (
                    <>
                        {leftIcon && <span className="flex items-center">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="flex items-center">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
