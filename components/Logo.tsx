import React, { FC } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'monochrome';
  className?: string;
}

const Logo: FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const LogoSvg = () => (
    <svg 
      viewBox="0 0 100 100" 
      className={`${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14F195" />
          <stop offset="100%" stopColor="#9945FF" />
        </linearGradient>
        <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAD02C" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
        <linearGradient id="white-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
        
        {/* Glow Effects */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill={variant === 'white' ? 'url(#white-gradient)' : variant === 'monochrome' ? '#1a1a1a' : 'url(#primary-gradient)'}
        filter="url(#shadow)"
        className="animate-pulse-slow"
      />
      
      {/* Inner Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="35" 
        fill="none" 
        stroke={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
        strokeWidth="1.5"
        strokeDasharray="5,2"
        className="animate-spin-slow"
      />
      
      {/* Central Bot Icon - Geometric Design */}
      <g transform="translate(50,50)">
        {/* Bot Head */}
        <rect 
          x="-12" 
          y="-15" 
          width="24" 
          height="18" 
          rx="3" 
          fill={variant === 'white' ? '#1a1a1a' : variant === 'monochrome' ? '#ffffff' : '#1a1a1a'}
          filter="url(#shadow)"
        />
        
        {/* Bot Eyes */}
        <circle 
          cx="-6" 
          cy="-8" 
          r="2.5" 
          fill={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#14F195' : 'url(#primary-gradient)'}
          className="animate-pulse-fast"
        />
        <circle 
          cx="6" 
          cy="-8" 
          r="2.5" 
          fill={variant === 'white' ? '#9945FF' : variant === 'monochrome' ? '#9945FF' : 'url(#accent-gradient)'}
          className="animate-pulse-fast"
          style={{ animationDelay: '0.2s' }}
        />
        
        {/* Bot Body */}
        <rect 
          x="-10" 
          y="3" 
          width="20" 
          height="15" 
          rx="2" 
          fill={variant === 'white' ? '#1a1a1a' : variant === 'monochrome' ? '#ffffff' : '#1a1a1a'}
          filter="url(#shadow)"
        />
        
        {/* Trading Chart Lines */}
        <g stroke={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#14F195' : 'url(#primary-gradient)'} strokeWidth="1.5" fill="none">
          <path d="M-6,8 L-3,5 L0,10 L3,6 L6,8" className="animate-pulse-slow"/>
        </g>
        
        {/* Bot Antennas */}
        <line 
          x1="-8" 
          y1="-15" 
          x2="-8" 
          y2="-20" 
          stroke={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#14F195' : 'url(#primary-gradient)'} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <line 
          x1="8" 
          y1="-15" 
          x2="8" 
          y2="-20" 
          stroke={variant === 'white' ? '#9945FF' : variant === 'monochrome' ? '#9945FF' : 'url(#accent-gradient)'} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        
        {/* Antenna Tips */}
        <circle 
          cx="-8" 
          cy="-22" 
          r="1.5" 
          fill={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#14F195' : 'url(#primary-gradient)'}
          filter="url(#glow)"
        />
        <circle 
          cx="8" 
          cy="-22" 
          r="1.5" 
          fill={variant === 'white' ? '#9945FF' : variant === 'monochrome' ? '#9945FF' : 'url(#accent-gradient)'}
          filter="url(#glow)"
        />
      </g>
      
      {/* Orbital Elements */}
      <g>
        <circle 
          cx="50" 
          cy="20" 
          r="1.5" 
          fill={variant === 'white' ? '#14F195' : variant === 'monochrome' ? '#14F195' : 'url(#primary-gradient)'}
          className="animate-float"
        />
        <circle 
          cx="80" 
          cy="50" 
          r="1" 
          fill={variant === 'white' ? '#9945FF' : variant === 'monochrome' ? '#9945FF' : 'url(#accent-gradient)'}
          className="animate-float-delayed"
        />
        <circle 
          cx="20" 
          cy="80" 
          r="1.2" 
          fill={variant === 'white' ? '#FAD02C' : variant === 'monochrome' ? '#FAD02C' : 'url(#accent-gradient)'}
          className="animate-float"
          style={{ animationDelay: '1s' }}
        />
      </g>
    </svg>
  );

  return <LogoSvg />;
};

export default Logo; 