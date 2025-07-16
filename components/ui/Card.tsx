import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; titleActions?: React.ReactNode }> = ({ children, className, title, titleActions }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
    {title && (
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{title}</h2>
        {titleActions && <div>{titleActions}</div>}
      </div>
    )}
    {children}
  </div>
);
