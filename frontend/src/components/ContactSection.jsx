import React from 'react';
import { MapPin, Phone, MessageCircle, Send, Clock, ArrowRight } from 'lucide-react';
import { siteData } from '../data/mock';
import { Button } from './ui/button';

const ContactSection = () => {
  const handleWhatsAppClick = (number) => {
    const cleanNumber = number.replace(/-/g, '');
    window.open(`https://wa.me/62${cleanNumber.substring(1)}`, '_blank');
  };

  return (
    <section id="kontak" className="py-20 lg:py-28 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Send className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Hubungi Kami</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Siap Mendaftarkan Anak Anda?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Hubungi kami sekarang untuk informasi lebih lanjut dan pendaftaran
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Address Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Alamat</h3>
                <p className="text-white/90 leading-relaxed">
                  {siteData.contact.address}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">WhatsApp</h3>
                <div className="space-y-2">
                  {siteData.contact.whatsapp.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleWhatsAppClick(number)}
                      className="flex items-center gap-3 w-full bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 transition-all group"
                    >
                      <Phone className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">{number}</span>
                      <ArrowRight className="w-4 h-4 text-white/70 ml-auto group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-white text-amber-600 hover:bg-gray-100 font-bold text-lg px-10 py-7 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group"
            onClick={() => handleWhatsAppClick(siteData.contact.whatsapp[0])}
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            Chat via WhatsApp
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
