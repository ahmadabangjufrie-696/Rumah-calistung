import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { siteData } from '../data/mock';

const RequirementsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-4">
            <AlertCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Persyaratan</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Syarat <span className="text-emerald-500">Pendaftaran</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pastikan anak Anda memenuhi persyaratan berikut untuk mengikuti program kami
          </p>
        </div>

        {/* Requirements Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 lg:p-10 shadow-xl border border-emerald-100">
            <div className="space-y-5">
              {siteData.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm text-emerald-600 font-semibold">Syarat {index + 1}</span>
                    <p className="text-lg font-medium text-gray-800 mt-1">{requirement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequirementsSection;
