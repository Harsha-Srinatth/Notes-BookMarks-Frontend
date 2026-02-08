import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) {
      return;
    }

    setIsReady(true);
    const token = localStorage.getItem('token');
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(router.pathname);

    if (token) {
      setIsAuthenticated(true);
    } else if (!isPublicPath && router.pathname !== '/') {
      // Only redirect if not already on a public path or home
      router.replace('/login');
    }
    setLoading(false);
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

  if (loading || !isReady) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="loading-spinner mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-lg text-gray-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
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
