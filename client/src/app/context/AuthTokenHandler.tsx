'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from './authContext';

export function AuthTokenHandler() {
  const { setAuthToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlToken = searchParams.get('token');

    if (urlToken) {
      // If a token is found in the URL, set it in our context
      setAuthToken(urlToken);
      // Clean the URL by redirecting to the same page without the token
      router.replace('/dashboard'); 
    }
  }, [searchParams, router, setAuthToken]);

  // This component renders nothing to the screen
  return null; 
}