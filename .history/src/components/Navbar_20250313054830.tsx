import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useDarkMode();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/competitive-analysis', label: 'Analysis' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-navbar-mobile md:h-navbar-desktop">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="font-heading font-bold text-[20px] text-gradient bg-gradient-to-r from-primary-indigo to-primary-purple">
                ReviewPro
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center space-x-8">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    font-body font-medium text-base px-3 py-2 transition-all duration-300
                    ${isActivePath(path)
                      ? 'text-primary-purple'
                      : 'text-text-dark hover:text-primary-purple dark:text-text-light'
                    }
                    hover:underline hover:decoration-2 hover:underline-offset-4
                  `}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="hidden md:flex md:items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-dark dark:text-text-light hover:text-primary-purple dark:hover:text-primary-purple transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link to="/signin">
                <button className="font-body text-base px-4 py-2 border border-primary-purple rounded-lg text-primary-purple hover:bg-gradient-to-r hover:from-primary-indigo hover:to-primary-purple hover:text-white transition-all duration-300">
                  Sign In
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                  inline-flex items-center justify-center p-2 rounded-lg
                  text-text-dark dark:text-text-light
                  hover:text-primary-purple dark:hover:text-primary-purple
                  focus:outline-none focus:ring-2 focus:ring-primary-purple
                  transition-transform duration-300
                  ${isMenuOpen ? 'rotate-45' : 'rotate-0'}
                `}
                aria-label="Main menu"
                aria-expanded={isMenuOpen ? "true" : "false"}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`
            fixed top-navbar-mobile right-0 bottom-0 w-sidebar
            bg-white/10 backdrop-blur-md border-l border-white/20
            transform transition-transform duration-300 ease-in-out md:hidden
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="px-4 py-6 space-y-6">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  block font-body text-base
                  ${isActivePath(path)
                    ? 'text-primary-purple'
                    : 'text-text-dark hover:text-primary-purple dark:text-text-light'
                  }
                  transition-colors duration-300
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-6 space-y-4">
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full font-body text-base px-4 py-2 border border-primary-purple rounded-lg text-primary-purple hover:bg-gradient-to-r hover:from-primary-indigo hover:to-primary-purple hover:text-white transition-all duration-300">
                  Sign In
                </button>
              </Link>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between font-body text-base px-4 py-2 text-text-dark dark:text-text-light"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                <span>
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;