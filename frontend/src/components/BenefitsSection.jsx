import React from 'react';
import { GraduationCap, Clock, Smile, Heart, Puzzle, CheckCircle2 } from 'lucide-react';
import { siteData } from '../data/mock';

const BenefitsSection = () => {
  const benefitIcons = [
    GraduationCap,
    Clock,
    Smile,
    Heart,
    Puzzle,
  ];

  const benefitColors = [
    'from-blue-500 to-cyan-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-500',
  ];

  return (
    <section id="program" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Kenapa Pilih Kami?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Keunggulan <span className="text-amber-500">Rumah Pintar</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan lingkungan belajar terbaik untuk membantu anak Anda berkembang
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {siteData.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index];
            return (
              <div
                key={benefit.id}
                className="group relative bg-white rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefitColors[index]} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-3xl">
                  <div className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${benefitColors[index]} opacity-10 rotate-45 group-hover:opacity-20 transition-opacity`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
