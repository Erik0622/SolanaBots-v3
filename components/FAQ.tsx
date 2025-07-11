'use client';

import React, { FC, useState, useRef, useEffect } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isVisible: boolean;
}

const FAQItem: FC<FAQItemProps> = ({ question, answer, index, isVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      className={`group relative mb-4 transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with Glassmorphism */}
      <div className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-500 overflow-hidden">
        
        {/* Dynamic background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}></div>
        </div>
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
        
        {/* Question Button */}
        <button
          className="w-full p-6 flex justify-between items-center text-left relative z-10 group/btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 ${isOpen ? 'rotate-180' : ''}`}>
              <span className="text-xl">❓</span>
            </div>
            
            {/* Question */}
            <h3 className="text-lg font-bold text-white group-hover/btn:text-primary transition-colors duration-300 flex-1">
              {question}
            </h3>
          </div>
          
          {/* Toggle Icon */}
          <div className={`relative transition-all duration-300 ${isOpen ? 'rotate-45' : ''} group-hover/btn:scale-110`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-black text-xl font-black">+</span>
            </div>
            
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300 -z-10`}></div>
          </div>
        </button>
        
        {/* Answer Content */}
        <div 
          ref={contentRef}
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ 
            maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 0}px` : '0px',
          }}
        >
          <div className="px-6 pb-6 relative z-10">
            <div className="pl-16"> {/* Align with question text */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <p className="text-white/80 leading-relaxed">{answer}</p>
                
                {/* Answer decoration */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  <span className="text-xs text-white/50 font-medium">Helpful?</span>
                  <div className="flex gap-2 ml-auto">
                    <button className="p-1 hover:bg-green-500/20 rounded-full transition-colors duration-200">
                      <span className="text-green-400 text-sm">👍</span>
                    </button>
                    <button className="p-1 hover:bg-red-500/20 rounded-full transition-colors duration-200">
                      <span className="text-red-400 text-sm">👎</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover particles */}
        {isHovered && (
          <>
            <div className="absolute top-4 right-4 w-1 h-1 bg-primary rounded-full animate-ping opacity-75"></div>
            <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-secondary rounded-full animate-bounce delay-200"></div>
            <div className="absolute top-1/2 left-4 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
          </>
        )}
      </div>
      
      {/* Enhanced shadow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
    </div>
  );
};

const FAQ: FC = () => {
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

  const faqItems = [
    {
      question: "How do the trading bots work?",
      answer: "Our trading bots use advanced algorithms for real-time analysis of market data. They identify potential trading opportunities based on volume trends, price movements, and market patterns. When a profitable opportunity is detected, the bot automatically executes trades according to your risk parameters."
    },
    {
      question: "What fees does SolBotQuants charge?",
      answer: "SolBotQuants charges a fee of 1% per transaction. There are no subscription fees or upfront costs - we only charge fees when trades are executed. This keeps our fee structure transparent and fair."
    },
    {
      question: "Is my cryptocurrency safe with SolBotQuants?",
      answer: "Yes, absolutely. SolBotQuants never takes custody of your funds. All operations are conducted through secure Solana smart contracts, with transactions requiring your explicit approval through your connected wallet. Your assets remain under your control at all times."
    },
    {
      question: "What returns can I expect?",
      answer: "While past performance is no guarantee of future results, our bots have historically generated annual returns between 300-800%, depending on market conditions and the specific bot strategy. The dashboard provides transparent performance metrics for all bot strategies."
    },
    {
      question: "Can I create my own trading bot?",
      answer: "Yes! Our Launchpad feature allows you to create custom trading bots with our AI-assisted tools. You can define your own strategies and even publish them for other users. When others use your bot strategy, you earn a share of the transaction fees."
    },
    {
      question: "Which cryptocurrencies do your bots trade?",
      answer: "Tokens on the Solana blockchain. Our bots are designed to trade various SPL tokens in the Solana ecosystem, focusing on tokens with sufficient liquidity and trading volume to ensure optimal performance."
    }
  ];

  return (
    <section ref={sectionRef} id="faq" className="relative py-20 px-6 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          sectionVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            <span className="font-semibold">Frequently Asked Questions</span>
            <span className="text-xl">❓</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">Everything you</span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              need to know
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Find answers to the most important questions about SolBotQuants and our automated trading solutions.
          </p>
        </div>
        
        {/* Enhanced FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index} 
              question={item.question} 
              answer={item.answer}
              index={index}
              isVisible={sectionVisible}
            />
          ))}
        </div>
        
        {/* Enhanced Contact CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
          sectionVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                More Questions?
              </h3>
              <p className="text-white/70">
                Our support team is always available to help you.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:contact@solbotquants.io" 
                className="group px-6 py-3 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">📧</span>
                  Email Support
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
              
              <a 
                href="https://x.com/solbotquants?s=21" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-primary/50 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🐦</span>
                  Twitter / X
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 