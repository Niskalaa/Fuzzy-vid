import React from 'react';
import { cn } from '../../lib/utils';

interface SegmentedControlProps<T extends string> {
  options: { label: React.ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex w-full rounded-lg bg-black/20 p-1 border border-glass-border-01', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex-1 text-sm rounded-md transition-colors duration-200 ease-in-out focus:outline-none',
            'py-1.5 px-3',
            value === option.value
              ? 'text-cream'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {value === option.value && (
            <span className="absolute inset-0 bg-white/10 rounded-md border border-white/20" />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
