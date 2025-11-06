import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Navigation Items
   * 
   * IMPORTANCE:
   * - Shared navigation items for desktop and mobile
   * - Ensures consistency between desktop and mobile menus
   * - Single source of truth for navigation structure
   */
  const navigationItems = [
    { to: '/', label: 'Home', anchor: null },
    { to: '/events', label: 'Browse Events', anchor: null },
    { to: '/', label: 'About Us', anchor: 'about' },
    { to: '/', label: 'Pricing', anchor: 'pricing' }
  ];

  /**
   * Handle Navigation Click
   * 
   * IMPORTANCE:
   * - Handles both anchor links and regular navigation
   * - Closes mobile menu after navigation
   * - Smooth scrolling for anchor links
   */
  const handleNavClick = (item: typeof navigationItems[0]) => {
    if (item.anchor) {
      setIsMobileMenuOpen(false);
      if (window.location.pathname !== '/') {
        window.location.href = '/';
        setTimeout(() => {
          document.getElementById(item.anchor!)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex justify-center items-center px-4 md:px-10 py-6 sticky top-0 bg-[#030712]/80 backdrop-blur-md z-50 shadow-md relative"
    >
      <div className="container mx-auto flex justify-between items-center max-w-7xl w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0"
      >
        <Link to="/">
          <h1 className="text-xl md:text-2xl font-bold text-[#00f5a0] tracking-tight hover:scale-105 transition-transform duration-300 ease-in-out whitespace-nowrap">STADIPASS</h1>
        </Link>
      </motion.div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-white hover:text-[#00f5a0] transition-colors flex-shrink-0 ml-2"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      
      {/* Desktop Navigation */}
      <nav className="space-x-6 hidden md:flex font-medium flex-1 justify-center">
        {navigationItems.map((item, index) => (
          <motion.div
            key={`${item.to}-${item.anchor || 'nav'}`}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            {item.anchor ? (
              <a
                href={`#${item.anchor}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname !== '/') {
                    window.location.href = '/';
                    setTimeout(() => {
                      document.getElementById(item.anchor!)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hover:text-[#00f5a0] transition-all duration-300 ease-in-out relative group cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00f5a0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </a>
            ) : (
              <Link 
                to={item.to} 
                className="hover:text-[#00f5a0] transition-all duration-300 ease-in-out relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00f5a0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            )}
          </motion.div>
        ))}
      </nav>

      {/* Desktop Auth Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex space-x-3"
      >
        {isAuthenticated ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                to="/dashboard"
                className="text-white hover:text-[#00f5a0] transition-all duration-300 ease-in-out"
              >
                Dashboard
              </Link>
            </motion.div>
            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
              >
                <Link
                  to="/admin"
                  className="text-white hover:text-[#00f5a0] transition-all duration-300 ease-in-out"
                >
                  Admin
                </Link>
              </motion.div>
            )}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-white mr-2"
            >
              {user?.firstName} {user?.lastName}
            </motion.span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0a0f1e] border-l border-[#00f5a0]/20 shadow-2xl z-[70] md:hidden flex flex-col"
            >
              <div className="flex-1 flex flex-col p-4 pt-16 overflow-y-auto">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-lg font-bold text-[#00f5a0]">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-white hover:text-[#00f5a0] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-2 mb-4 flex-shrink-0">
                  {navigationItems.map((item) => (
                    <div key={`mobile-${item.to}-${item.anchor || 'nav'}`}>
                      {item.anchor ? (
                        <a
                          href={`#${item.anchor}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item);
                          }}
                          className="block py-2.5 text-white hover:text-[#00f5a0] transition-colors border-b border-gray-700/50 text-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={() => handleNavClick(item)}
                          className="block py-2.5 text-white hover:text-[#00f5a0] transition-colors border-b border-gray-700/50 text-sm"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Auth Section */}
                <div className="space-y-2.5 pt-3 border-t border-gray-700/50 flex-shrink-0 mt-auto">
                  {isAuthenticated ? (
                    <>
                      <div className="mb-3">
                        <p className="text-gray-400 text-xs mb-1">Logged in as</p>
                        <p className="text-white font-semibold text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#00f5a0]/20 text-[#00f5a0] text-xs rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-2 text-center text-white hover:text-[#00f5a0] transition-colors border border-[#00f5a0]/30 rounded-lg text-sm"
                      >
                        Dashboard
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full py-2 text-center text-white hover:text-[#00f5a0] transition-colors border border-[#00f5a0]/30 rounded-lg text-sm"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full py-2 text-sm"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full py-2 text-sm">
                          Login
                        </Button>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button className="w-full py-2 text-sm">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
