import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex justify-center items-center px-4 md:px-10 py-6 sticky top-0 bg-[#030712]/80 backdrop-blur-md z-50 shadow-md"
    >
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <Link to="/">
          <h1 className="text-2xl font-bold text-[#00f5a0] tracking-tight hover:scale-105 transition-transform duration-300 ease-in-out">STADIPASS</h1>
        </Link>
      </motion.div>
      
      {/* Desktop Navigation */}
      <nav className="space-x-6 hidden md:flex font-medium">
        {[
          { to: '/', label: 'Home' },
          { to: '/events', label: 'Events' },
          { to: '/about', label: 'About Us' },
          { to: '/pricing', label: 'Pricing' },
          { to: '/contact', label: 'Contact' }
        ].map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
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
      </nav>

      {/* Auth Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex space-x-3"
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
                className="text-white hover:text-[#00f5a0] transition-all duration-300 ease-in-out hidden md:block"
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
                  className="text-white hover:text-[#00f5a0] transition-all duration-300 ease-in-out hidden md:block"
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
              className="text-white hidden md:block mr-2"
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
    </motion.header>
  );
}
