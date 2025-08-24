import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import GeometricAnimation from './GeometricAnimation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const HeroSection = ({ Loaded, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const statsRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [animateScroll, setAnimateScroll] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (statsRef.current && contentRef.current && Loaded) {
      gsap.fromTo(
        statsRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );

      gsap.fromTo(
        contentRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1, stagger: 0.2 }
      );
    }
  }, [Loaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateScroll(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsMobileMenuOpen(false);
    };

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
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
    { id: 'products', label: 'Products' },
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
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      className="relative h-screen bg-transparent text-white overflow-hidden"
      id="home"
      ref={heroRef}
    >
      <GeometricAnimation paused={!isHeroInView} />

      {/* Background Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/90 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-21 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full fixed top-0 z-50 backdrop-blur-sm bg-black/20">
        <div className="relative flex items-center px-[4vw] py-6 w-full">
          {/* Logo */}
          <div className="absolute left-[2vw] flex items-center">
            <img src="/logoGenReal.png" alt="GenReal.AI Logo" className="h-[3.5rem]" />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex justify-center items-center w-full text-base gap-8 font-light">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={`${getLinkClass(
                    link.id
                  )} transition-all duration-300 cursor-pointer pb-1`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <div className="absolute right-[4vw] md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <ul className="md:hidden px-[4vw] pb-6 space-y-4 bg-black/90 backdrop-blur-md">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollToSection(link.id)}
                  className={`${getLinkClass(
                    link.id
                  )} w-full text-left py-2 transition-all duration-300`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Main Hero Content */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center items-center px-[4vw]">
        <div className="text-center max-w-5xl" ref={contentRef}>
          {/* Gradient Main Heading */}
          <div className="opacity-0">
            <h1 className="text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] font-extrabold mb-4">
              <span className="bg-gradient-to-r from-[#6EE5F5] via-[#29A3B3] to-[#1397A9] bg-clip-text text-transparent">
                Welcome to GenReal AI
              </span>
            </h1>
          </div>

          {/* White Secondary Heading */}
          <div className="opacity-0">
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-8">
              The Future of Digital Security
            </h2>
          </div>

          {/* CTA Button */}
          <div className="opacity-0">
            <button
              onClick={() => scrollToSection('products')}
              className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="absolute opacity-0 w-full bottom-8 z-40 px-[4vw]">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
          {/* Left Stat */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                80%
              </h3>
            </div>
            <p className="text-gray-300 text-sm lg:text-base max-w-xs">
              of companies lack adequate protocols to handle deepfake attacks
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="hidden lg:flex flex-col items-center space-y-3">
            <div
              className={`transition-all duration-1000 ease-out ${
                animateScroll ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2'
              }`}
            >
              <p className="text-gray-400 text-sm mb-2">Scroll to explore</p>
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>

          {/* Right Stat */}
          <div className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-end space-x-3 mb-2">
              <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                60%
              </h3>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-300 text-sm lg:text-base max-w-xs">
              of people encountered a deepfake video in the past year
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
