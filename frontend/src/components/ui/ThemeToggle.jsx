import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';

const ThemeToggle = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    // Observe class changes on <html>
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Listen to storage changes (in case of multiple tabs)
    const onStorage = (e) => {
      if (e.key === 'theme') update();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleToggle = () => {
    if (typeof document === 'undefined') return;
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    try { localStorage.setItem('theme', nextIsDark ? 'dark' : 'light'); } catch (e) {}
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
    </button>
  );
};

export default ThemeToggle;


