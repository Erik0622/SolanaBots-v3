import React, { FC, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

const Footer: FC = () => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const socialLinks = [
    { name: 'Twitter/X', href: 'https://x.com/solbotquants?s=21', icon: '🐦', color: 'from-blue-400 to-cyan-500' },
    { name: 'Telegram', href: '#', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { name: 'Discord', href: '#', icon: '💬', color: 'from-indigo-500 to-purple-600' },
    { name: 'GitHub', href: '#', icon: '🐙', color: 'from-gray-700 to-gray-900' },
  ];

  const quickLinks = [
    { name: 'API Documentation', href: '/api-docs', icon: '📚' },
    { name: 'Terms of Service', href: '/terms', icon: '📄' },
    { name: 'Privacy Policy', href: '/privacy', icon: '🔒' },
    { name: 'Security', href: '/security', icon: '🛡️' },
  ];

  const botLinks = [
    { name: 'Volume Tracker', href: '/#bots', icon: '📊' },
    { name: 'Momentum Bot', href: '/#bots', icon: '🚀' },
    { name: 'Dip Hunter', href: '/#bots', icon: '💎' },
    { name: 'Custom Bots', href: '/launchpad', icon: '⚙️' },
  ];

  return (
    <footer className="relative bg-dark px-6 py-16 border-t border-white/10 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="group mb-6">
              {/* Enhanced Logo */}
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="lg" className="group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-black">
                  <span className="text-white">Sol</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Bot</span>
                  <span className="text-[#FAD02C]">Quants</span>
                </div>
              </div>
            </div>
            
            <p className="text-white/70 mb-6 leading-relaxed">
              Intelligente Trading-Bots für die Solana-Blockchain mit bewährter Rentabilität und modernem Risikomanagement.
            </p>
            
            {/* Social Links */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
                Follow us
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative p-3 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-110`}
                    onMouseEnter={() => setHoveredLink(social.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </span>
                    
                    {/* Hover background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>
                    
                    {/* Tooltip */}
                    {hoveredLink === social.name && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs whitespace-nowrap animate-fade-in-up">
                        {social.name}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Trading Bots Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Trading Bots
            </h4>
            <ul className="space-y-3">
              {botLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center gap-3 text-white/70 hover:text-primary transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="group-hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center gap-3 text-white/70 hover:text-primary transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="group-hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact & Developer Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="text-2xl">📞</span>
              Contact
            </h4>
            
            <div className="space-y-4">
              <a 
                href="mailto:contact@solbotquants.io" 
                className="group flex items-center gap-3 text-white/70 hover:text-primary transition-all duration-300 hover:translate-x-1"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300">📧</span>
                <span className="group-hover:text-white transition-colors duration-300">
                  contact@solbotquants.io
                </span>
              </a>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-2 font-semibold">Developer Wallet:</p>
                <div className="group p-3 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 rounded-xl transition-all duration-300">
                  <p className="text-primary text-xs font-mono break-all group-hover:text-white transition-colors duration-300">
                    81EWHKqwf2bfVfFn71VcLY1VvnxDXsHQAyy85PZLc38D
                  </p>
                  <button 
                    onClick={() => navigator.clipboard.writeText('81EWHKqwf2bfVfFn71VcLY1VvnxDXsHQAyy85PZLc38D')}
                    className="mt-2 text-xs text-white/60 hover:text-primary transition-colors duration-300 flex items-center gap-1"
                  >
                    <span>📋</span>
                    Copy Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Newsletter Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-3xl">📬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-white/70">
                Erhalte die neuesten Updates über neue Features, Trading-Strategien und Performance-Insights.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Deine E-Mail Adresse"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 focus:border-primary/50 rounded-xl text-white placeholder-white/50 transition-all duration-300 focus:outline-none"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-white/60">© {new Date().getFullYear()} SolBotQuants. All rights reserved.</p>
              <p className="text-white/50 text-sm mt-1">
                Trading bots involve inherent risks. Past performance is not indicative of future results.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">
                  All Systems Operational
                </span>
              </div>
              
              <div className="text-white/50 text-sm">
                Built with ❤️ on Solana
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 