import React from 'react';
import { BookOpen, Pencil, Calculator, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { siteData } from '../data/mock';

const HeroSection = () => {
  const skillIcons = {
    Membaca: BookOpen,
    Menulis: Pencil,
    Menghitung: Calculator,
  };

  const skillColors = {
    Membaca: 'from-blue-400 to-cyan-400',
    Menulis: 'from-rose-400 to-pink-400',
    Menghitung: 'from-emerald-400 to-teal-400',
  };

  return (
    <section id="beranda" className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Decorative Icons */}
      <div className="absolute top-32 right-20 hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center rotate-12">
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="absolute top-48 left-20 hidden lg:block animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center -rotate-12">
          <Pencil className="w-7 h-7 text-rose-500" />
        </div>
      </div>
      <div className="absolute bottom-32 left-32 hidden lg:block animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
        <div className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center rotate-6">
          <Calculator className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Pendaftaran Dibuka!</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              {siteData.hero.title}
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '100ms' }}>
            {siteData.hero.subtitle}
          </h2>

          {/* Age Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg mb-8 animate-in fade-in zoom-in duration-500" style={{ animationDelay: '200ms' }}>
            <span className="text-lg md:text-xl font-bold">{siteData.hero.ageInfo}</span>
          </div>

          {/* Problem Statement */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '300ms' }}>
            <p className="text-xl md:text-2xl text-gray-600 mb-6 italic">{siteData.hero.problemText}</p>
            
            {/* Skills Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              {siteData.hero.skills.map((skill, index) => {
                const Icon = skillIcons[skill];
                return (
                  <div
                    key={skill}
                    className={`group relative flex items-center gap-3 bg-gradient-to-r ${skillColors[skill]} px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default`}
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-lg font-bold text-white">{skill}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solution Text */}
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: '600ms' }}>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {siteData.hero.solutionText}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700" style={{ animationDelay: '700ms' }}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              onClick={() => window.open('https://wa.me/6285211068989', '_blank')}
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-bold text-lg px-8 py-6 rounded-full transition-all duration-300"
              onClick={() => document.getElementById('program').scrollIntoView({ behavior: 'smooth' })}
            >
              Lihat Program
            </Button>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
