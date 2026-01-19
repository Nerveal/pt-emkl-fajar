import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, options, placeholder, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        {...props}
                        ref={ref}
                        className={`
              w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10
              text-white placeholder-slate-500 appearance-none
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
                    >
                        {placeholder && <option value="" disabled className="bg-surface-dark text-slate-500">{placeholder}</option>}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-surface-dark text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                    </div>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
