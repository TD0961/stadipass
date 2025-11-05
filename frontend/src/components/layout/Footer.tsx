import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="py-10 text-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Link to="/">
          <h1 className="text-2xl font-bold text-[#00f5a0] mb-4 hover:scale-105 transition-transform duration-300 ease-in-out inline-block">STADIPASS</h1>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="space-x-6 mb-4 flex justify-center flex-wrap gap-4"
      >
        {[
          { to: '/', label: 'Home' },
          { to: '/events', label: 'Events' },
          { to: '/about', label: 'About Us' },
          { to: '/pricing', label: 'Pricing' },
          { to: '/contact', label: 'Contact' }
        ].map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <Link 
              to={item.to} 
              className="hover:text-[#00f5a0] transition-all duration-300 ease-in-out relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00f5a0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="text-gray-500 text-sm"
      >
        © 2025 StadiPass. All rights reserved.
      </motion.p>
    </footer>
  );
}
