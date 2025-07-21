'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { token } = useAuth();
  const router = useRouter();

  // If there's no token, redirect to the login page
  useEffect(() => {
    if (token === null) {
      router.push('/login');
    }
  }, [token, router]);

  // If the token is still being loaded, show a loading state
  if (token === null) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  // Render the dashboard content only if there is a token
  return (
    <div>
      <h1 className="text-3xl font-bold">My Portfolio Dashboard</h1>
      {/* All your portfolio management components will go here */}
    </div>
  );
};

export default DashboardPage;