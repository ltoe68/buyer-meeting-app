import React from 'react';

export const Card = ({ className, children, ...props }) => (
    <div className={`rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm ${className || ''}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
        {children}
    </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
    <p className={`text-sm text-slate-500 ${className || ''}`} {...props}>
        {children}
    </p>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={`p-6 pt-0 ${className || ''}`} {...props}>
        {children}
    </div>
);
