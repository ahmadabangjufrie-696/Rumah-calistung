import React, { useState } from 'react';
import { Calendar, Clock, Users, User, Info } from 'lucide-react';
import { siteData } from '../data/mock';
import { Button } from './ui/button';

const ScheduleSection = () => {
  const [activeTab, setActiveTab] = useState('regular');

  const tabs = [
    { id: 'regular', label: 'Kelas Reguler', icon: Users },
    { id: 'private', label: 'Kelas Privat', icon: User },
  ];

  const activeClass = activeTab === 'regular' ? siteData.classes.regular : siteData.classes.private;

  return (
    <section id="jadwal" className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-amber-50/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Jadwal Kelas</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pilih <span className="text-amber-500">Waktu Belajar</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jadwal fleksibel yang bisa disesuaikan dengan aktivitas anak Anda
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Schedule Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-10 border border-gray-100">
            {/* Class Title */}
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {activeClass.title}
              </h3>
              {activeClass.note && (
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm">
                  <Info className="w-4 h-4" />
                  {activeClass.note}
                </div>
              )}
            </div>

            {/* Schedule Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {activeClass.schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-amber-50/50 rounded-2xl p-6 border border-amber-100/50"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    {schedule.days}
                  </h4>
                  <div className="space-y-3">
                    {schedule.times.map((timeSlot, timeIndex) => (
                      <div
                        key={timeIndex}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="font-medium text-gray-700">{timeSlot.session}</span>
                        <div className="flex items-center gap-2 text-amber-600 font-semibold">
                          <Clock className="w-4 h-4" />
                          {timeSlot.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => window.open('https://wa.me/6285211068989', '_blank')}
              >
                Pilih Jadwal Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
