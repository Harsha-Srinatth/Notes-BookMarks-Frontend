import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Wait for router to be ready before redirecting
    if (!router.isReady) {
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/notes');
    } else {
      router.replace('/login');
    }
  }, [router.isReady]);

  return null;
}

