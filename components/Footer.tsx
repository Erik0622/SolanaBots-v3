"use client";

import React, { FC } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Rocket, 
  Target, 
  Github, 
  Twitter, 
  MessageCircle,
  Mail,
  ArrowRight,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Volume Tracker', href: '/#bots', icon: BarChart3 },
    { name: 'Momentum Bot', href: '/#bots', icon: Rocket },
    { name: 'Dip Hunter', href: '/#bots', icon: Target },
  ];

  const resources = [
    { name: 'Documentation', href: '/api-docs' },
    { name: 'API Reference', href: '/api-docs' },
    { name: 'Getting Started', href: '/dashboard' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const legal = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Risk Disclosure', href: '/risk' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Discord', href: '#', icon: MessageCircle },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-black border-t border-gray-700/50 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Trading Bots
                  </h3>
                  <p className="text-xs text-gray-400">Solana Network</p>
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-6">
                Advanced AI-powered trading bots designed for the Solana ecosystem. 
                Maximize your profits with automated, intelligent trading strategies.
              </p>

              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">System Online</span>
              </div>

              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <IconComponent className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-400" />
                Trading Bots
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Resources
              </h4>
              <ul className="space-y-3">
                {resources.map((resource) => (
                  <li key={resource.name}>
                    <Link
                      href={resource.href}
                      className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{resource.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-400" />
                Legal & Support
              </h4>
              <ul className="space-y-3">
                {legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Performance Stats */}
              <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-2">24h Performance</div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">+12.4%</span>
                  <span className="text-gray-500">avg return</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © {currentYear} Solana Trading Bots. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Built on Solana • Powered by AI • Secured by smart contracts
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">All systems operational</span>
                </div>
                
                <div className="h-4 w-px bg-gray-600"></div>
                
                <div className="text-sm text-gray-400">
                  <span>99.9% uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 