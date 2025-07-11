'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const DesktopSidebar: FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { href: '#bots', label: 'Trading Bots', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', isRoute: false },
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', isRoute: true },
    { href: '/launchpad', label: 'Launchpad', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', isRoute: true },
    { href: '#features', label: 'Features', icon: 'M13 10V3L4 14h7v7l9-11h-7z', isRoute: false },
    { href: '#faq', label: 'Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', isRoute: false }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full bg-gradient-to-b from-dark via-dark-light to-dark border-r border-white/10 backdrop-blur-xl z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-white/[0.01] to-transparent"></div>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col h-full w-full">
          
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Logo size="lg" className="hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col">
                  <div className="text-xl font-black text-white">
                    Sol<span className="text-primary">Bot</span><span className="text-[#FAD02C]">Quants</span>
                  </div>
                  <div className="text-xs text-white/60 font-medium">Trading Platform</div>
                </div>
              )}
            </div>
            
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
            >
              <svg className={`w-3 h-3 text-black transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Component = item.isRoute ? Link : 'a';
              return (
                <Component
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    item.isRoute && isActive(item.href)
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-white shadow-lg shadow-primary/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Icon */}
                  <div className="relative">
                    <svg className={`w-6 h-6 transition-all duration-300 ${hoveredItem === item.href ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    
                    {/* Active Indicator */}
                    {item.isRoute && isActive(item.href) && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-20 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Label */}
                  {!isCollapsed && (
                    <span className="font-semibold group-hover:translate-x-1 transition-transform duration-300">
                      {item.label}
                    </span>
                  )}
                  
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  
                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && hoveredItem === item.href && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm whitespace-nowrap z-50 animate-fade-in-right">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/90 rotate-45 border-l border-b border-white/20"></div>
                    </div>
                  )}
                </Component>
              );
            })}
          </nav>
          
          {/* Wallet Section */}
          <div className="p-4 border-t border-white/10">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="text-xs text-white/60 font-semibold uppercase tracking-wider">Wallet</div>
                <WalletMultiButton className="!w-full !bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !rounded-xl !py-3 !transition-all !duration-300 hover:!scale-[1.02] hover:!shadow-lg hover:!shadow-primary/30" />
              </div>
            ) : (
              <div className="flex justify-center">
                <WalletMultiButton className="!w-12 !h-12 !min-h-0 !bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !rounded-xl !transition-all !duration-300 hover:!scale-110 hover:!shadow-lg hover:!shadow-primary/30 !text-xs" />
              </div>
            )}
          </div>
          
          {/* Status Indicator */}
          <div className="p-4 border-t border-white/10">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              {!isCollapsed && (
                <div>
                  <div className="text-xs text-green-400 font-semibold">System Online</div>
                  <div className="text-xs text-white/50">All services operational</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Content Spacer for Desktop */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}></div>
    </>
  );
};

const MobileNavigation: FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { href: '#bots', label: 'Trading Bots', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', isRoute: false },
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', isRoute: true },
    { href: '/launchpad', label: 'Launchpad', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', isRoute: true },
    { href: '#features', label: 'Features', icon: 'M13 10V3L4 14h7v7l9-11h-7z', isRoute: false },
    { href: '#faq', label: 'Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', isRoute: false }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className={`lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Logo size="md" className="hover:scale-110 transition-transform duration-300" />
            <div className="text-xl font-black text-white">
              Sol<span className="text-primary">Bot</span><span className="text-[#FAD02C]">Quants</span>
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
              <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 top-3 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
            </div>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={`absolute top-24 left-6 right-6 bg-gradient-to-br from-dark via-dark-light to-dark border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl transition-all duration-500 ${
          mobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
        }`}>
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent rounded-3xl"></div>
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 p-6">
            
            {/* Menu Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <Logo size="sm" />
              <div>
                <div className="text-lg font-bold text-white">Navigation</div>
                <div className="text-xs text-white/60">Select a destination</div>
              </div>
            </div>
            
            {/* Navigation Items */}
            <div className="space-y-3 mb-6">
              {navigationItems.map((item, index) => {
                const Component = item.isRoute ? Link : 'a';
                return (
                  <Component
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      item.isRoute && isActive(item.href)
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className="relative">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      
                      {/* Active Indicator */}
                      {item.isRoute && isActive(item.href) && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg opacity-20 animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className="font-semibold flex-1 group-hover:translate-x-1 transition-transform duration-300">
                      {item.label}
                    </span>
                    
                    {/* Arrow */}
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Component>
                );
              })}
            </div>
            
            {/* Wallet Section */}
            <div className="pt-6 border-t border-white/10">
              <div className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Connect Wallet</div>
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !rounded-xl !py-4 !transition-all !duration-300 hover:!scale-[1.02] hover:!shadow-lg hover:!shadow-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Navigation: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress})` }}></div>
      
      {/* Navigation Components */}
      {isClient && (
        <>
          <DesktopSidebar />
          <MobileNavigation />
        </>
      )}
    </>
  );
};

export default Navigation; 