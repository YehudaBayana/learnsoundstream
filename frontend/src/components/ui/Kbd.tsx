import React from 'react';

export interface KbdProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const Kbd: React.FC<KbdProps> = ({ children, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-1 min-w-[1.25rem] h-4 text-[9px]',
    sm: 'px-1.5 min-w-[1.5rem] h-5 text-[11px]',
    md: 'px-2 min-w-[2rem] h-6 text-xs',
  };

  return (
    <kbd
      className={`
        inline-flex items-center justify-center
        font-sans font-semibold
        bg-gray-100 dark:bg-slate-800
        text-gray-600 dark:text-slate-400
        border border-gray-300 dark:border-slate-700
        rounded shadow-[0_1px_0_rgba(0,0,0,0.1)]
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </kbd>
  );
};

export default Kbd;
