import React from 'react';
import { cn } from '../../lib/utils';

const GlassButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg border border-glass-border-02 bg-glass-02 px-4 py-2 text-sm font-medium text-text-primary shadow-glass transition-colors hover:bg-glass-04 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-bg-deep disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
GlassButton.displayName = 'GlassButton';

export { GlassButton };
