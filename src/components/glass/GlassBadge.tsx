import React from 'react';
import { cn } from '../../lib/utils';

interface GlassBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'orange' | 'blue';
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      className={cn(
        'inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold',
        'backdrop-blur-sm',
        variant === 'default' &&
          'border-glass-border-01 bg-glass-01 text-text-secondary',
        variant === 'orange' &&
          'border-accent-orange/30 bg-accent-orange-dim text-accent-orange',
        variant === 'blue' &&
          'border-accent-blue/30 bg-accent-blue-dim text-accent-blue',
        className
      )}
      {...props}
    />
  );
};
