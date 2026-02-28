import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../glass/GlassCard';

const Header = () => {
  return (
    <GlassCard variant="subtle" className="rounded-none">
        <header className="flex items-center justify-between p-4">
            <Link to="/" className="text-2xl font-bold text-accent-orange">
                Fuzzy Short
            </Link>
            <nav className="flex items-center space-x-4">
                <Link to="/" className="text-text-secondary hover:text-text-primary">Home</Link>
                <Link to="/storyboard" className="text-text-secondary hover:text-text-primary">Storyboard</Link>
                <Link to="/project" className="text-text-secondary hover:text-text-primary">Project</Link>
                <Link to="/settings" className="text-text-secondary hover:text-text-primary">Settings</Link>
            </nav>
        </header>
    </GlassCard>
  );
};

export default Header;
