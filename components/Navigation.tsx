'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
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
import ReactDOM from 'react-dom';

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

const SimpleMobileMenu: FC<{ isOpen: boolean; onClose: () => void; navigationItems: any[] }> = ({ isOpen, onClose, navigationItems }) => {
  if (typeof window === 'undefined') return null;
  return ReactDOM.createPortal(
    isOpen ? (
      <div className="fixed inset-0 z-[200]">
        <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
        <div className="absolute top-0 right-0 w-64 h-full bg-gray-900 shadow-2xl p-6 flex flex-col">
          <button onClick={onClose} className="self-end mb-8 text-white text-2xl">×</button>
          <nav className="flex-1">
            <ul className="space-y-6">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white text-lg" onClick={onClose}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    ) : null,
    document.body
  );
};

const MobileNavigation: FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Gauge },
    { href: '/my-bots', label: 'My Bots', icon: BarChart3 },
    { href: '/launchpad', label: 'Launchpad', icon: Rocket },
    { href: '/api-docs', label: 'API Docs', icon: HelpCircle }
  ];

  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 z-50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Bots
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      <SimpleMobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} navigationItems={navigationItems} />
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