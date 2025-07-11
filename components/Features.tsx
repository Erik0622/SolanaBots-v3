'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const FeatureCard: FC<{
  title: string;
  description: string;
  icon: string;
  gradient: string;
  buttonText: string;
  buttonLink: string;
  delay: number;
  features: string[];
}> = ({ title, description, icon, gradient, buttonText, buttonLink, delay, features }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered 
          ? `rotateX(${-(mousePosition.y - 200) / 30}deg) rotateY(${(mousePosition.x - 200) / 30}deg) translateZ(20px)`
          : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Enhanced Background with Glassmorphism */}
      <div className="relative bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/20 rounded-3xl transition-all duration-500 group-hover:border-white/40 group-hover:bg-white/[0.15] h-full">
        
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 241, 149, 0.15) 0%, transparent 50%)`,
              transition: 'background 0.3s ease',
            }}
          ></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}></div>
        </div>
        
        {/* Gradient Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-2xl`}></div>
        
        {/* Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* Enhanced Icon */}
          <div className={`mb-6 relative transition-all duration-500 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 backdrop-blur-sm border border-white/10`}>
              <span className="text-4xl filter drop-shadow-lg">{icon}</span>
            </div>
            
            {/* Floating particles */}
            {isHovered && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></div>
                <div className="absolute top-1/2 -right-3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
              </>
            )}
            
            {/* Glow ring */}
            <div className={`absolute inset-0 rounded-3xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient.includes('primary') ? 'border-primary/30' : gradient.includes('secondary') ? 'border-secondary/30' : 'border-orange-400/30'} animate-pulse`}></div>
          </div>
          
          {/* Enhanced Title */}
          <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent group-hover:from-white group-hover:to-primary transition-all duration-300">
            {title}
          </h3>
          
          {/* Enhanced Description */}
          <p className="text-white/70 text-base leading-relaxed mb-6 flex-grow">
            {description}
          </p>
          
          {/* Feature List */}
          <div className="mb-6">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`}></div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Enhanced Button */}
          <Link
            href={buttonLink}
            className={`group/btn relative px-6 py-3 bg-gradient-to-r ${gradient} text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden text-center`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {buttonText}
              <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </Link>
        </div>
      </div>
      
      {/* Enhanced Shadow */}
      <div className={`absolute -inset-2 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
    </div>
  );
};

const ProcessStep: FC<{
  number: number;
  title: string;
  description: string;
  delay: number;
  icon: string;
}> = ({ number, title, description, delay, icon }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={stepRef}
      className={`group relative text-center transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Number Circle */}
      <div className="relative mx-auto mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/50 transition-all duration-500 group-hover:scale-110 backdrop-blur-sm border border-white/10">
          <span className="text-3xl font-black text-black">{number}</span>
        </div>
        
        {/* Icon overlay */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm">{icon}</span>
        </div>
        
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping-slow opacity-75"></div>
        <div className={`absolute inset-0 rounded-full border-2 border-secondary/30 transition-opacity duration-500 ${isHovered ? 'animate-spin opacity-100' : 'opacity-0'}`}></div>
        
        {/* Connecting line (except for last step) */}
        {number < 3 && (
          <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/30 to-transparent transform -translate-y-1/2">
            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-shimmer opacity-60"></div>
          </div>
        )}
      </div>
      
      {/* Enhanced Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto group-hover:text-white/90 transition-colors duration-300">
          {description}
        </p>
      </div>
      
      {/* Hover effects */}
      {isHovered && (
        <>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-ping"></div>
          <div className="absolute bottom-0 left-1/4 w-0.5 h-0.5 bg-secondary rounded-full animate-bounce delay-200"></div>
          <div className="absolute bottom-0 right-1/4 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
        </>
      )}
    </div>
  );
};

const Features: FC = () => {
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Smart Trading Bots",
      description: "Nutze unsere bewährten Trading-Algorithmen, die Marktdaten in Echtzeit analysieren und profitable Gelegenheiten mit Präzision und Geschwindigkeit identifizieren.",
      icon: "🤖",
      gradient: "from-primary to-green-400",
      buttonText: "Explore Bots",
      buttonLink: "#bots",
      features: [
        "Real-time Marktanalyse",
        "KI-gestützte Algorithmen",
        "24/7 automatische Ausführung",
        "Risikomanagement integriert"
      ]
    },
    {
      title: "Live Performance Dashboard",
      description: "Überwache deine Trading-Performance mit Echtzeit-Analytics, Position-Tracking und umfassenden Profit-Visualisierungs-Tools.",
      icon: "📊",
      gradient: "from-secondary to-purple-400", 
      buttonText: "Go to Dashboard",
      buttonLink: "/dashboard",
      features: [
        "Echtzeit Portfolio-Tracking",
        "Detaillierte Performance-Metriken",
        "Gewinn/Verlust Visualisierung",
        "Historische Datenanalyse"
      ]
    },
    {
      title: "AI-Powered Bot Launchpad",
      description: "Erstelle deine eigenen Trading-Bots mit unseren KI-unterstützten Tools und verdiene an Transaktionsgebühren, wenn andere deine Strategien nutzen.",
      icon: "🚀",
      gradient: "from-orange-400 to-red-400",
      buttonText: "Launch Now",
      buttonLink: "/launchpad",
      features: [
        "Drag & Drop Bot-Builder",
        "Strategie-Templates",
        "Backtesting-Tools",
        "Revenue-Sharing-Modell"
      ]
    }
  ];

  const steps = [
    {
      title: "Wallet Verbinden",
      description: "Verbinde dein Solana Wallet sicher mit unserer Plattform durch One-Click-Integration.",
      icon: "🔗"
    },
    {
      title: "Bot Auswählen",
      description: "Wähle aus unseren bewährten Trading-Bot-Strategien oder erstelle deine eigene maßgeschneiderte Lösung.",
      icon: "🤖"
    },
    {
      title: "Gewinne Erzielen",
      description: "Überwache deine Performance und sammle deine Erträge automatisch ein.",
      icon: "💰"
    }
  ];

  return (
    <section ref={sectionRef} id="features" className="relative py-20 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary/5 via-secondary/5 to-primary/5 rounded-full blur-3xl animate-spin-slow"></div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          sectionVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            <span className="font-semibold">Powerful Features</span>
            <span className="text-xl">⚡</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">Alles was du brauchst</span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              für Erfolg
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Unsere Plattform bietet fortschrittliche Trading-Tools, die entwickelt wurden, um deine Gewinne zu maximieren 
            und gleichzeitig das Risiko durch modernste Technologie zu minimieren.
          </p>
        </div>
        
        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={index * 200}
            />
          ))}
        </div>
        
        {/* Enhanced How It Works */}
        <div className={`text-center mb-16 transition-all duration-1000 delay-600 ${
          sectionVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 border border-secondary/20 rounded-full text-sm text-secondary mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
            <span className="font-semibold">So funktioniert's</span>
            <span className="text-xl">🔄</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">Einfach</span>
            <span className="block bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent animate-gradient-x">
              & Effektiv
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Starte in nur drei einfachen Schritten mit dem automatisierten Trading und maximiere deine Gewinne.
          </p>
        </div>
        
        {/* Enhanced Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.title}
              number={index + 1}
              title={step.title}
              description={step.description}
              delay={800 + index * 200}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 