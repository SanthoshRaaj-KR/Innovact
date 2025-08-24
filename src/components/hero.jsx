import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import GeometricAnimation from './GeometricAnimation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const HeroSection = ({ Loaded }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home'); // Default to home
  const statsRef = useRef(null);
  const heroRef = useRef(null);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [animateScroll, setAnimateScroll] = useState(false);

  useEffect(() => {
    if (statsRef.current && Loaded) {
      gsap.fromTo(
        statsRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0 }
      );
    }
  }, [Loaded]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateScroll(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Effect to close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsMobileMenuOpen(false);
    };

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, []);

  // Effect for setting active section
  useEffect(() => {
    const sections = ['home', 'about', 'products', 'news'];
    const observers = sections.map(id => {
      const section = document.getElementById(id);
      if (!section) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      }, { rootMargin: "-50% 0px -50% 0px" }); // Triggers when section is in the middle of the viewport
      observer.observe(section);
      return observer;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    const currentHeroRef = heroRef.current;
    if (currentHeroRef) observer.observe(currentHeroRef);
    return () => {
      if (currentHeroRef) observer.unobserve(currentHeroRef);
    };
  }, []);
  
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'products', label: "Products"},
    { id: 'news', label: 'News' },
  ];

  const getLinkClass = (id) =>
    activeSection === id
      ? 'text-white font-semibold border-b-2 border-cyan-400'
      : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-cyan-400/50';

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking a link
  };

  return (
    <div className="relative h-screen bg-transparent text-white overflow-hidden" id="home" ref={heroRef}>
      <GeometricAnimation paused={!isHeroInView} />
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/70 via-black/40 to-black z-20 pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="w-full fixed top-0 z-50 backdrop-blur-sm bg-black/20">
        <div className="relative flex items-center px-[4vw] py-6 w-full">
          {/* Logo */}
          <div className="absolute left-[2vw] flex items-center">
            <img src="/logoGenReal.png" alt="GenReal.AI Logo" className="h-[3.5rem]" />
          </div>

          {/* Desktop Nav - UPDATED LINE BELOW */}
          <ul className="hidden md:flex justify-center items-center w-full text-[clamp(1rem,1.5vw,1.25rem)] gap-8 font-light">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={`${getLinkClass(link.id)} transition-all duration-300 cursor-pointer pb-1`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <div className="absolute right-[4vw] md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={ isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16' }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - UPDATED LINE BELOW */}
        {isMobileMenuOpen && (
          <ul className="md:hidden text-lg px-[4vw] pb-6 space-y-4 bg-black/90 backdrop-blur-md">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={`${getLinkClass(link.id)} w-full text-left py-2 transition-all duration-300`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-[clamp(3rem,12vw,8rem)] sm:text-[clamp(3.5rem,10vw,7rem)] md:text-[clamp(4rem,8vw,6rem)] lg:text-[clamp(4.5rem,7vw,5.5rem)] xl:text-[clamp(5rem,6vw,6rem)] leading-[0.9] font-bold whitespace-nowrap">
            Welcome to<br />
            <span className="bg-gradient-to-r from-[#6EE5F5] via-[#29A3B3] to-[#1397A9] bg-clip-text text-transparent">
              GenReal
            </span>.AI
          </h1>
          <p className="mt-[clamp(1rem,2vw,2rem)] text-[clamp(0.875rem,1.5vw,1.125rem)] text-gray-300">
            Discover the new age of security
          </p>
          <div className="relative pointer-events-auto">
            <a href="#products">
              <button 
                className="get-started-btn mt-[clamp(1.5rem,3vw,2rem)] bg-orange-400 hover:bg-orange-500 text-white px-[clamp(1.5rem,2vw,2rem)] py-[clamp(0.75rem,1vw,1rem)] rounded-full text-[clamp(0.875rem,1vw,1rem)] font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started →
              </button>
            </a>
          </div>
        </div>
      </div>
      
      <div
        ref={statsRef}
        className="absolute opacity-0 w-full bottom-0 z-40 flex flex-col md:flex-row justify-around items-center px-8 py-4 space-y-6 md:space-y-0 pointer-events-auto"
      >
        <div className="text-center">
          <h2 className="text-cyan-400 text-4xl font-bold">80%</h2>
          <p className="text-gray-400 mt-2 text-sm max-w-xs">of companies lack protocols to handle deepfake attacks</p>
        </div>
        <div className=' translate-y-6 h-[4vw] hidden md:flex justify-center items-center flex-col'>
          <p className={`relative transition-all text-white/60 duration-1000 ease-out ${animateScroll ? 'top-0' : 'top-[20px]'}`}>Scroll Down</p>
          <div className='w-full -mt-1 z-[99] h-[2vw] bg-black'></div>
        </div>
        <div className="text-center">
          <h2 className="text-cyan-400 text-4xl font-bold">60%</h2>
          <p className="text-gray-400 mt-2 text-sm max-w-xs">of people encountered a deepfake video in the past year</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;