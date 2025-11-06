import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import ParticlesBackground from './ParticlesBackground';
import { ToastContainer } from '../ui/Toast';
import { useToastStore } from '../../stores/toastStore';

interface LayoutProps {
  children: ReactNode;
  /**
   * Show header on this page
   * 
   * IMPORTANCE:
   * - Auth pages (login, register) don't need full header
   * - Provides cleaner UX for authentication flows
   * - Homepage and other pages show full navigation
   */
  showHeader?: boolean;
  /**
   * Show footer on this page
   * 
   * IMPORTANCE:
   * - Auth pages may not need footer
   * - Consistent branding on main pages
   */
  showFooter?: boolean;
}

export default function Layout({ children, showHeader = true, showFooter = true }: LayoutProps) {
  const { toasts, remove } = useToastStore();
  const location = useLocation();

  /**
   * Determine if header/footer should be shown
   * 
   * IMPORTANCE:
   * - Auth pages get minimal layout
   * - Other pages get full layout with navigation
   */
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/oauth/callback'].includes(location.pathname);
  const shouldShowHeader = showHeader && !isAuthPage;
  const shouldShowFooter = showFooter && !isAuthPage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#030712] text-white font-sans overflow-hidden relative"
    >
      <ParticlesBackground />
      <div className="relative z-10">
        {shouldShowHeader && <Header />}
        <main className="flex-grow">
          {children}
        </main>
        {shouldShowFooter && <Footer />}
      </div>
      <ToastContainer toasts={toasts} onClose={remove} />
    </motion.div>
  );
}
