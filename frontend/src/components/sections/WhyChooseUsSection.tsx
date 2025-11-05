import { motion } from 'framer-motion';
import { Ticket, Smartphone, Globe, Zap } from 'lucide-react';

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 px-4 md:px-20 text-center relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">Why Choose Us?</h2>
          <p className="text-gray-300 text-lg">Everything you need for a seamless stadium experience</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[
          { 
            icon: <Globe className="text-[#00f5a0] w-12 h-12" />, 
            title: 'Multiple Stadiums', 
            desc: 'Access to premium stadiums nationwide with one platform' 
          },
          { 
            icon: <Ticket className="text-[#00f5a0] w-12 h-12" />, 
            title: 'Easy Booking', 
            desc: 'Book your tickets in seconds with our intuitive platform' 
          },
          { 
            icon: <Smartphone className="text-[#00f5a0] w-12 h-12" />, 
            title: 'Digital Tickets', 
            desc: 'Secure QR code tickets delivered instantly to your device' 
          },
          { 
            icon: <Zap className="text-[#00f5a0] w-12 h-12" />, 
            title: 'Fast Entry', 
            desc: 'Quick validation and seamless entry at stadium gates' 
          }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="p-6 rounded-xl border border-[#00f5a0]/30 bg-[#030712] hover:border-[#00f5a0] hover:shadow-lg hover:shadow-[#00f5a0]/20 transition-all duration-300 ease-in-out"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/20">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-gray-200 text-center leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}

