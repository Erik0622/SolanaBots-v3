'use client';

import React, { FC, useEffect, useState, useRef } from 'react';
import { useWallet, WalletMultiButton } from './ClientWalletProvider';
import Link from 'next/link';

const Hero: FC = () => {
  const { connected } = useWallet();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, opacity: number}>>([]);
  const heroRef = useRef<HTMLElement>(null);
  const requestRef = useRef<number>();
  
  useEffect(() => {
    setIsVisible(true);
    
    // Initialize particles
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        const newY = particle.y - particle.speed;
        return {
          ...particle,
          y: newY < 0 ? window.innerHeight : newY,
          opacity: newY < 0 ? Math.random() * 0.5 + 0.1 : particle.opacity
        };
      }));
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  const stats = [
    { 
      value: '+460%', 
      label: 'Avg Monthly Return', 
      color: 'from-emerald-400 to-green-500',
      icon: '📈',
      description: 'Average returns over the last 6 months'
    },
    { 
      value: '+178%', 
      label: 'Last 7 Days', 
      color: 'from-blue-400 to-cyan-500',
      icon: '⚡',
      description: 'Performance in the last week'
    },
    { 
      value: '24/7', 
      label: 'Automated Trading', 
      color: 'from-purple-400 to-pink-500',
      icon: '🤖',
      description: 'Non-stop automated execution'
    },
    { 
      value: '99.9%', 
      label: 'Uptime', 
      color: 'from-amber-400 to-orange-500',
      icon: '🛡️',
      description: 'Reliable infrastructure guaranteed'
    },
  ];
  
  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-dark">
        
        {/* Floating Orbs with 3D Effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-3xl animate-spin-slow"></div>
          
          {/* Additional floating elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl animate-float-slow"></div>
        </div>
        
        {/* Interactive Particle System */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                transform: `translate(${(mousePosition.x - particle.x) * 0.01}px, ${(mousePosition.y - particle.y) * 0.01}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          ))}
        </div>
        
        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 241, 149, 0.15) 0%, transparent 50%)`,
              transition: 'background-image 0.3s ease',
            }}
          ></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}></div>
        </div>
      </div>
      
      {/* Enhanced Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-full text-sm mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <div className="relative">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="font-semibold text-primary">Live Trading</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="font-medium text-white/80">High Performance Bots</span>
            <span className="text-xl animate-bounce">🚀</span>
          </div>
          
          {/* Enhanced Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight text-center">
            <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="block text-white mb-4">Next-Gen</span>
            </div>
            <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x relative">
                Trading Bots
                {/* Glowing underline */}
                <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50 blur-sm"></div>
              </span>
            </div>
            <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="block text-white/90 text-4xl sm:text-5xl lg:text-6xl font-bold mt-4">
                for <span className="text-[#FAD02C]">Solana</span>
              </span>
            </div>
          </h1>
          
          {/* Enhanced Subtitle */}
          <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 max-w-5xl mx-auto mb-12 leading-relaxed text-center">
              Maximiere deine Gewinne mit <span className="relative group">
                <span className="text-primary font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">KI-gestützten</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </span> Trading-Algorithmen
              die <span className="relative group">
                <span className="text-secondary font-bold bg-gradient-to-r from-secondary to-purple-400 bg-clip-text text-transparent">24/7</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </span> auf der schnellsten Blockchain arbeiten.
            </p>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {connected ? (
              <Link 
                href="/dashboard" 
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-black font-black text-lg rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  Go to Dashboard
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </span>
                
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              </Link>
            ) : (
              <div className="group relative">
                <WalletMultiButton className="!px-8 !py-4 !bg-gradient-to-r !from-primary !to-secondary !text-black !font-black !text-lg !rounded-2xl !transition-all !duration-300 hover:!scale-110 hover:!shadow-2xl hover:!shadow-primary/40" />
                
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
              </div>
            )}
            
            <Link 
              href="#bots" 
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-primary/50 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-white/20 flex items-center gap-3"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform">📊</span>
              Explore Bots
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className={`transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`group relative bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:bg-white/[0.12] ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${1400 + index * 100}ms` }}
                >
                  {/* Background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    
                    {/* Value */}
                    <div className={`text-3xl lg:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </div>
                    
                    {/* Label */}
                    <div className="text-white/70 text-sm font-semibold mb-2">
                      {stat.label}
                    </div>
                    
                    {/* Description */}
                    <div className="text-white/50 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {stat.description}
                    </div>
                  </div>
                  
                  {/* Floating particles on hover */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-2 right-2 w-1 h-1 bg-primary rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-secondary rounded-full animate-ping delay-200"></div>
                    <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-primary rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="group cursor-pointer" onClick={() => document.getElementById('bots')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center group-hover:border-primary/50 transition-colors duration-300">
              <div className="w-1.5 h-4 bg-gradient-to-b from-primary to-secondary rounded-full mt-3 animate-pulse group-hover:animate-bounce"></div>
            </div>
            <div className="text-white/50 text-xs text-center mt-2 group-hover:text-primary/70 transition-colors duration-300">
              Scroll
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance indicator */}
      <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2 text-green-400 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live Performance
        </span>
      </div>
    </section>
  );
};

export default Hero; 