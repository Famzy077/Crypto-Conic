'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/authContext'
import Image from 'next/image';
import { LogOut } from 'lucide-react';
const NavBar = () => {
  const { token, logoutUser } = useAuth();

  return (
    <nav className="bg-gray-800 fixed w-[100%] z-10 top-0 left-0 text-white py-0 p-4 shadow-md">
      <div className="lg:container lg:mx-auto flex justify-between items-center">
        <Link href="/" className=" font-bold text-blue-400 flex items-center">
          <Image src={'/image/logo.png'} alt='logo' width={100} height={100} className='max-sm:w-[90px] w-[120px] max-sm:h-[60px] h-[75px]' title='logo image'/>
          <h2 className='transform max-sm:hidden text-2xl -translate-x-6'>CryptoCronic</h2>
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
                onClick={logoutUser} title='logout'
                className="bg-red-600 hover:bg-red-700 px-3 max-sm:px-2 py-1 rounded-md transition-colors"
              >
                <LogOut size={26}/>
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

export default NavBar;