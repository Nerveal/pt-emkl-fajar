import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, startIcon, endIcon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-accent">
                            {startIcon}
                        </div>
                    )}
                    <input
                        {...props}
                        ref={ref}
                        className={`
              w-full bg-white/5 border border-white/10 rounded-xl py-2.5 
              ${startIcon ? 'pl-10' : 'pl-4'} 
              ${endIcon ? 'pr-10' : 'pr-4'} 
              text-white placeholder-slate-500 
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
                    />
                    {endIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                            {endIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
