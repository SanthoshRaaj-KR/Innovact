import React, { useState, useEffect } from 'react';
import { Shield, FileSearch, Mic, Video, Code, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeepfakeDetectionPlatform = () => {
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleCard = (index) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const services = [
    {
      icon: Shield,
      bigTitle: "DEEPFAKE DETECTION",
      subtitle: "Protect Your Content with AI-Powered Detection",
      // Simplified content for the back of the card
      subServices: [
        { icon: Mic, name: "Audio Only" },
        { icon: Video, name: "Audio & Video" }
      ],
      buttonLabel: "Try Detection Tool",
      path: "/deepfake-detection",
      bgImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23064e77;stop-opacity:0.3'/%3E%3Cstop offset='100%25' style='stop-color:%23155e75;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg1)'/%3E%3Cg opacity='0.4'%3E%3Ccircle cx='80' cy='80' r='3' fill='%2306b6d4'/%3E%3Ccircle cx='320' cy='60' r='2' fill='%2306b6d4'/%3E%3Ccircle cx='150' cy='180' r='2.5' fill='%2306b6d4'/%3E%3Ccircle cx='280' cy='220' r='2' fill='%2306b6d4'/%3E%3Cpath d='M50 150 Q200 100 350 200' stroke='%2306b6d4' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M100 250 Q250 180 380 240' stroke='%2306b6d4' stroke-width='1' fill='none' opacity='0.2'/%3E%3C/g%3E%3Ctext x='200' y='160' text-anchor='middle' fill='%2306b6d4' font-family='Arial' font-size='24' font-weight='bold' opacity='0.1'%3EDETECT%3C/text%3E%3C/svg%3E"
    },
    {
      icon: FileSearch,
      bigTitle: "PLAGIARISM DETECTION",
      subtitle: "Ensure Academic Integrity with AI Detection",
      // Simplified content for the back of the card
      subServices: [
        { icon: Code, name: "Code Plagiarism" },
        { icon: FileText, name: "Text & Essay Analysis" }
      ],
      buttonLabel: "Try Plagiarism Tool",
      path: "/plagiarism-detection",
      bgImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23075985;stop-opacity:0.3'/%3E%3Cstop offset='100%25' style='stop-color:%234338ca;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23bg2)'/%3E%3Cg opacity='0.3'%3E%3Crect x='60' y='60' width='80' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='60' y='80' width='120' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='60' y='100' width='90' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='220' y='60' width='100' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='220' y='80' width='80' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='220' y='100' width='110' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='60' y='160' width='70' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='60' y='180' width='140' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='220' y='160' width='90' height='4' fill='%2306b6d4' rx='2'/%3E%3Crect x='220' y='180' width='75' height='4' fill='%2306b6d4' rx='2'/%3E%3C/g%3E%3Ctext x='200' y='260' text-anchor='middle' fill='%2306b6d4' font-family='Arial' font-size='20' font-weight='bold' opacity='0.1'%3EVERIFY%3C/text%3E%3C/svg%3E"
    }
  ];

  return (
    <div className="relative min-h-screen py-10 sm:py-18 bg-black overflow-hidden" id="products">
      {/* Header */}
      <div className={`relative z-20 pt-8 pb-12 sm:pb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
            <span className="block">
              <span className="text-cyan-400">Deepfake Detection</span>
              {' '} & {' '}
              <span className="text-cyan-400">AI Plagiarism Prevention</span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Cutting-edge AI tools to identify manipulated media and detect AI-generated content — built for trust, transparency, and digital integrity.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isFlipped = flippedCards.has(index);

            return (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} [perspective:1200px]`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onClick={() => toggleCard(index)}
              >
                {/* Responsive Height Container */}
                <div
                  className={`relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[65vh] transition-transform duration-1000 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                >

                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-700 hover:scale-[1.02] flex flex-col items-center justify-center overflow-hidden [backface-visibility:hidden]"
                    style={{
                      backgroundImage: `url("${service.bgImage}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-slate-900/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 text-center px-6 sm:px-8">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center mb-6 sm:mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm border border-cyan-400/20">
                        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 mb-4 sm:mb-6 tracking-wide leading-tight">
                        {service.bigTitle}
                      </h2>
                      <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                        {service.subtitle}
                      </p>
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-cyan-500/20">
                        <p className="text-cyan-300 text-sm font-medium uppercase tracking-widest">
                          Click for Details
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-cyan-400/40 shadow-2xl p-6 sm:p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/20 flex-shrink-0">
                          <Icon className="w-7 h-7 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{service.bigTitle}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-base mb-8">
                        We offer specialized detection models tailored for different types of content.
                      </p>
                      
                      {/* Simplified Sub-Services */}
                      <div className="space-y-4 mb-8">
                        <h4 className="text-white font-semibold text-lg mb-4">Detection Services:</h4>
                        {service.subServices.map((sub, idx) => {
                          const SubIcon = sub.icon;
                          return (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-lg border border-slate-700">
                              <SubIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                              <span className="text-base font-medium text-gray-200">{sub.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          className="w-full py-4 px-6 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-white font-semibold text-lg hover:bg-cyan-500/40 hover:border-cyan-300/60 transition-all duration-300 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(service.path);
                          }}
                        >
                          <span className="flex items-center justify-center gap-2">
                            {service.buttonLabel}
                            <span className="inline-block group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetectionPlatform;