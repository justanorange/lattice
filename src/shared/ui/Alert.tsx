/**
 * Alert Component (shadcn/ui style)
 * Display notifications and messages
 */

import * as React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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
  success: <CheckCircle className="size-5" />,
  error: <AlertCircle className="size-5" />,
  warning: <AlertTriangle className="size-5" />,
  info: <Info className="size-5" />,
};

/**
 * Alert component
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, message, onClose, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-4',
          'flex items-start justify-between gap-3',
          'border',
          typeClasses[type],
          className
        )}
        {...props}
      >
        <div className="flex flex-1 items-start gap-3">
          <div className="mt-0.5 shrink-0">{iconMap[type]}</div>
          <div className="flex-1">
            {title && <h3 className="mb-1 font-medium">{title}</h3>}
            <p className="text-sm">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
