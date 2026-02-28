import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { X } from 'lucide-react';

interface GlassModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80 backdrop-blur-md"
      onClick={onClose}
    >
      <GlassCard
        variant="strong"
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-glass-border-02 p-4">
          <h2 className="text-lg font-medium text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </GlassCard>
    </motion.div>
  );
};
