import React from 'react';
import { cn } from '../../lib/utils';

const GlassInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        'relative block w-full rounded-lg border border-glass-border-02 bg-glass-01 px-3 py-2 text-text-primary shadow-inner placeholder:text-text-muted focus:border-glass-border-03 focus:outline-none focus:ring-1 focus:ring-accent-blue',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
GlassInput.displayName = 'GlassInput';

export { GlassInput };
