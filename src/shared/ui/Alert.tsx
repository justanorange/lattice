/**
 * Alert Component
 * Display notifications and messages
 */

import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

export type { AlertProps };

const typeClasses: Record<AlertType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
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
        border rounded-lg p-4 flex items-start justify-between
        ${typeClasses[type]}
        ${className || ''}
      `}
      {...props}
    >
      <div className="flex-1">
        {title && <h3 className="font-medium mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-2xl leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
