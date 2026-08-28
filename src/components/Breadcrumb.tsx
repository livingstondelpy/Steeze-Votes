import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.onClick ? (
                <span
                  className={`truncate max-w-[180px] sm:max-w-[320px] ${
                    isLast ? 'font-semibold text-gray-900' : 'text-gray-500'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none hover:underline"
                >
                  {item.icon ? (
                    <span className="shrink-0">{item.icon}</span>
                  ) : index === 0 ? (
                    <Home className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  ) : null}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
