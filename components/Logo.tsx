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
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl', 
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-20 h-20 text-5xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center relative group`}>
      {/* Main Logo Container */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30 rounded-2xl p-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
        
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Logo Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Robot/Bot Symbol */}
          <span className="text-primary font-black filter drop-shadow-lg group-hover:animate-pulse">
            🤖
          </span>
          
          {/* Trading Chart Indicator */}
          <div className="absolute -top-1 -right-1 text-xs">
            <span className="text-green-400 animate-bounce">📈</span>
          </div>
          
          {/* Solana/Crypto Indicator */}
          <div className="absolute -bottom-1 -left-1 text-xs">
            <span className="text-yellow-400 animate-pulse">⚡</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo; 