import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-xl border text-gray-900 shadow ${className}`} {...props}>
      {props.children}
    </div>
  );
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export {
  CardTitle,
  CardDescription,
}; 