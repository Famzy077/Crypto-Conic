'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/authContext';

const Header = () => {
  const { token, logoutUser } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-400">
          CryptoTracker
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/news" className="hover:text-blue-300 transition-colors">
            News
          </Link>

          {/* This is the important part */}
          {token ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-300 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logoutUser}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-300 transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;