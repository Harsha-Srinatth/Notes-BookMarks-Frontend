import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const redirect = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          router.replace('/notes').catch(() => {
            // Ignore navigation errors
          });
        } else {
          router.replace('/login').catch(() => {
            // Ignore navigation errors
          });
        }
      } catch (error) {
        console.error('Redirect error:', error);
        router.replace('/login').catch(() => {});
      }
    };

    if (router.isReady) {
      redirect();
    } else {
      // Wait for router to be ready
      const handleRouteChange = () => {
        if (router.isReady) {
          redirect();
        }
      };
      
      router.events?.on('routeChangeComplete', handleRouteChange);
      
      return () => {
        router.events?.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner" />
    </div>
  );
}

