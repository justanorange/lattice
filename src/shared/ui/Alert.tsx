/**
 * Alert Component
 * Display notifications and messages
 */

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

export type { AlertProps };

const typeClasses: Record<AlertType, string> = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
};

const iconMap: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

/**
 * Alert component
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
  ...props
}) => {
  return (
    <div
      className={`
        border rounded-2xl p-4 flex items-start justify-between gap-3
        ${typeClasses[type]}
        ${className || ''}
      `}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="shrink-0 mt-0.5">{iconMap[type]}</div>
        <div className="flex-1">
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-current opacity-70 hover:opacity-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
