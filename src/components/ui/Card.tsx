import React from 'react';

type CardVariant = 'default' | 'glass' | 'gradient' | 'outlined';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  hoverable = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';

  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-lg',
    glass: 'glass glass-dark',
    gradient: 'gradient-primary text-white',
    outlined: 'border-2 border-gray-200 dark:border-gray-700',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer focus-ring'
    : '';

  const hoverStyles = hoverable
    ? 'hover-lift'
    : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${interactiveStyles}
        ${hoverStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
      <div>
        <h3 className="text-h3 font-heading">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`mt-6 flex items-center justify-end gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;