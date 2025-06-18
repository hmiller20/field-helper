import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-md flex flex-col gap-2 ${variantClasses[variant]} ${className}`}>
      {title && <strong className="font-bold">{title}</strong>}
      <div>{message}</div>
    </div>
  );
};

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Alert;
