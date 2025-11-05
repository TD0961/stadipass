import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import allPlayersImage from '../../assets/All-players.jpg';
import stadiumImage from '../../assets/stadium2.jpg';
import AnimatedCounter from './AnimatedCounter';

export default function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center px-4 md:px-20 py-16 md:py-20 gap-12 relative overflow-hidden">
      {/* Background Image for entire hero section */}
      <div 
        className="absolute inset-0 z-0 rounded-2xl shadow-2xl"
        style={{
          backgroundImage: `url(${allPlayersImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px)',
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-lg space-y-6 text-center md:text-left"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            STADIUM ACCESS <span className="bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent drop-shadow-md">MADE EASY</span>
          </h2>
          <p className="text-gray-100 text-lg md:text-xl leading-relaxed font-light">
            Experience seamless stadium access with digital tickets, instant booking, and hassle-free entry. Join thousands of fans who trust StadiPass for their favorite events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
            <Link to="/events">
              <Button className="px-6 py-3 text-lg rounded-full">
                Browse Events
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="px-6 py-3 rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-wrap justify-center md:justify-start gap-8 mt-10"
          >
            <div className="text-center md:text-left">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent">
                <AnimatedCounter value={28} duration={2000} />
              </h3>
              <p className="text-gray-200 font-medium">Stadiums</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent">
                <AnimatedCounter value={980} suffix="+" duration={2000} />
              </h3>
              <p className="text-gray-200 font-medium">Events</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent">
                <AnimatedCounter value={180} suffix="K+" duration={2000} />
              </h3>
              <p className="text-gray-200 font-medium">Active Users</p>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full md:w-1/2 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-3xl w-full max-w-md aspect-square overflow-hidden shadow-2xl opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out"
            style={{
              backgroundImage: `url(${stadiumImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
