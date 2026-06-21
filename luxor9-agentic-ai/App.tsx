import React, { useState, useEffect } from 'react';
import { AgentType } from './types';
import { AgentSelector } from './components/AgentSelector';
import { AgentWorkstation } from './components/AgentWorkstation';
import { McpPanel } from './components/McpPanel';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.OVERSEER);
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Launch State
  const [hasLaunched, setHasLaunched] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('luxor9_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(initialDark);
  }, []);

  // Update DOM when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('luxor9_theme', 'dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#09090b');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('luxor9_theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fafafa');
    }
  }, [isDarkMode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Settings with Ctrl/Cmd + ,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsMcpOpen(prev => !prev);
      }
      
      // Launch from Landing with Cmd+K
      if (!hasLaunched && !isLaunching && (e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleLaunch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasLaunched, isLaunching]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLaunch = () => {
      setIsLaunching(true);
      setTimeout(() => {
          setHasLaunched(true);
          setIsLaunching(false);
      }, 1000); // Wait for LandingPage exit animation
  };

  return (
    <>
      {/* Landing Page Layer: Stays mounted during launch animation */}
      {(!hasLaunched || isLaunching) && (
        <LandingPage onLaunch={handleLaunch} isLaunching={isLaunching} />
      )}

      {/* Main App Layer */}
      {hasLaunched && !isLaunching && (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-200 overflow-hidden relative selection:bg-amber-500/30 transition-colors duration-300 animate-in fade-in duration-1000">
          <McpPanel 
            isOpen={isMcpOpen} 
            onClose={() => setIsMcpOpen(false)} 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />

          {/* Mobile: Bottom Order. Desktop: Left/First Order */}
          <div className="order-2 md:order-1 flex-none z-30">
            <AgentSelector 
              activeAgent={activeAgent} 
              onSelect={setActiveAgent} 
              onOpenMcp={() => setIsMcpOpen(true)}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          </div>
          
          {/* Main Content */}
          <div className="order-1 md:order-2 flex-1 h-full relative min-h-0 z-0">
            <AgentWorkstation 
              agent={activeAgent} 
              onOpenMcp={() => setIsMcpOpen(true)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;