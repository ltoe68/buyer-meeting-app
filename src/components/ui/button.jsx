import React from 'react';

export const Button = ({ className, variant, size, children, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "underline-offset-4 hover:underline text-slate-900",
    };
    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    };

    const variantStyles = variants[variant || 'default'];
    const sizeStyles = sizes[size || 'default'];

    return (
        <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`} {...props}>
            {children}
        </button>
    );
};
