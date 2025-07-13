'use client';

import React, { FC } from 'react';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact';
  className?: string;
}

const Logo: FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6', 
    xl: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center relative group`}>
      
      {/* Main Logo Container */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 w-full h-full">
        
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Logo Icon Stack */}
        <div className="relative z-10 flex items-center justify-center">
          
          {/* Main Trading Icon */}
          <BarChart3 className={`${iconSizes[size]} text-primary filter drop-shadow-lg group-hover:animate-pulse`} />
          
          {/* Trading Indicators */}
          <div className="absolute -top-0.5 -right-0.5">
            <TrendingUp className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-green-400 animate-bounce`} />
          </div>
          
          {/* Lightning/Speed Indicator */}
          <div className="absolute -bottom-0.5 -left-0.5">
            <Zap className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-yellow-400 animate-pulse`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo; 