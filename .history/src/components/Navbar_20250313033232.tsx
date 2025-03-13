import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useDarkMode();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 transition-colors animate-fade-in">
      <div className="glass glass-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-heading font-bold text-gradient">
                ReviewPro
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors hover-lift
                    ${isActivePath(path)
                      ? 'text-primary-indigo dark:text-primary-purple'
                      : 'text-gray-700 hover:text-primary-indigo dark:text-gray-300 dark:hover:text-primary-purple'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 hover:text-primary-indigo dark:text-gray-300 dark:hover:text-primary-purple focus-ring hover-lift"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <Link to="/signin">
                <Button variant="glass" size="sm" className="hover-lift">
                  Sign In
                </Button>
              </Link>
              <Link to="/get-started">
                <Button variant="primary" size="sm" className="hover-lift">
                  Start 3-Day Trial
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-primary-indigo dark:text-gray-300 dark:hover:text-primary-purple focus-ring"
                aria-label="Main menu"
                aria-expanded="false"
              >
                {!isMenuOpen ? (
                  <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden glass glass-dark border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    block px-3 py-2 rounded-lg text-base font-medium transition-colors
                    ${isActivePath(path)
                      ? 'text-primary-indigo dark:text-primary-purple'
                      : 'text-gray-700 hover:text-primary-indigo dark:text-gray-300 dark:hover:text-primary-purple'
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-2">
                <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="glass" fullWidth className="hover-lift">
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" fullWidth className="hover-lift">
                    Start 3-Day Trial
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-primary-indigo dark:text-gray-300 dark:hover:text-primary-purple"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  <span className="ml-2">
                    {theme === 'dark' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;