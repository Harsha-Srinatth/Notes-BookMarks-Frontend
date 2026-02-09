import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication only on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const publicPaths = ['/login', '/register'];
        const isPublicPath = publicPaths.includes(router.pathname);

        if (token) {
          setIsAuthenticated(true);
        } else if (!isPublicPath && router.pathname !== '/') {
          // Only redirect if not already on a public path or home
          if (router.isReady) {
            router.replace('/login').catch(() => {
              // Ignore navigation errors
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      checkAuth();
    } else {
      // Wait for router to be ready
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      
      router.events?.on('routeChangeComplete', checkAuth);
      
      return () => {
        clearTimeout(timer);
        router.events?.off('routeChangeComplete', checkAuth);
      };
    }
  }, [router.isReady, router.pathname]);

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3
      }
    }
  };

  // Show loading only briefly to prevent abort errors
  if (loading && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Render component immediately to prevent abort errors
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={router.asPath}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
}
