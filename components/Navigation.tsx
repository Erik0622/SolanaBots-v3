'use client';

import React, { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { 
  BarChart3, 
  Gauge, 
  Rocket, 
  Zap, 
  HelpCircle, 
  Menu, 
  X, 
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';

const DesktopSidebar: FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Gauge },
    { href: '/my-bots', label: 'My Bots', icon: BarChart3 },
    { href: '/launchpad', label: 'Launchpad', icon: Rocket },
    { href: '/api-docs', label: 'API Docs', icon: HelpCircle }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white border-r border-gray-700 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Logo size="lg" />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trading Bots
              </h1>
              <p className="text-xs text-gray-400">Solana Network</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-gray-800 border border-gray-600 rounded-full p-1.5 text-white hover:bg-gray-700 transition-colors"
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Navigation */}
      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <IconComponent className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  
                  {!isCollapsed && (
                    <span className="transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute right-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && hoveredItem === item.href && (
                    <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap border border-gray-600 shadow-lg z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className={`flex items-center space-x-2 p-2 bg-gray-800 rounded-lg border border-gray-700 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <Wifi className="w-4 h-4 text-green-400" />
          {!isCollapsed && (
            <div>
              <p className="text-xs font-medium text-green-400">Connected</p>
              <p className="text-xs text-gray-500">Solana Mainnet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Komplett neues mobiles Menü
const MobileMenu: FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  
  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Gauge },
    { href: '/my-bots', label: 'My Bots', icon: BarChart3 },
    { href: '/launchpad', label: 'Launchpad', icon: Rocket },
    { href: '/api-docs', label: 'API Docs', icon: HelpCircle }
  ];

  const isActive = (path: string) => pathname === path;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Bots
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mr-3 ${
                        active ? 'text-white' : 'text-gray-400'
                      }`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status Indicator */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <Wifi className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs font-medium text-green-400">Connected</p>
                <p className="text-xs text-gray-500">Solana Mainnet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileNavigation: FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Menü schließen bei Seiten-Wechsel
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Menü schließen bei Escape-Taste
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Bots
            </h1>
          </div>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

const Navigation: FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </>
  );
};

export default Navigation; 