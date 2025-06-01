'use client';

import React, { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const wallet = useWallet();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${isScrolled ? 'bg-dark shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-white">Sol<span className="text-primary">Bot</span><span className="text-[#FAD02C]">Quants</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#bots" className="text-white/80 hover:text-primary transition-colors">
            Bots
          </Link>
          <Link
            href="/dashboard"
            className={`text-white/80 hover:text-primary transition-colors ${
              isActive('/dashboard')
                ? 'text-primary border-b-2 border-primary pb-1'
                : ''
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/launchpad"
            className={`text-white/80 hover:text-primary transition-colors ${
              isActive('/launchpad')
                ? 'text-primary border-b-2 border-primary pb-1'
                : ''
            }`}
          >
            Launchpad
          </Link>
          <a href="#features" className="text-white/80 hover:text-primary transition-colors">
            Features
          </a>
          <a href="#faq" className="text-white/80 hover:text-primary transition-colors">
            FAQ
          </a>
          {isClient && <WalletMultiButton />}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          {isClient && <WalletMultiButton className="mr-4" />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-6 py-4 space-y-4">
            <Link href="#bots" className="block text-white/80 hover:text-primary transition-colors">
              Bots
            </Link>
            <Link
              href="/dashboard"
              className={`block text-white/80 hover:text-primary transition-colors ${
                isActive('/dashboard') ? 'text-primary' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/launchpad"
              className={`block text-white/80 hover:text-primary transition-colors ${
                isActive('/launchpad') ? 'text-primary' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Launchpad
            </Link>
            <a href="#features" className="block text-white/80 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#faq" className="block text-white/80 hover:text-primary transition-colors">
              FAQ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 