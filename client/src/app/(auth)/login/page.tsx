'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/authContext';
import { FaGoogle } from 'react-icons/fa';
import GoogleImg from '../../../../public/image/googleIcon.png'
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerUser({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
        <p className='text-[17px] mb-5'>Please enter your credentials to login</p>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Login
        </button>
            <a href={`${API_URL}/api/auth/google` }>
                <div className='border py-1 rounded transition duration-300 mt-3 flex items-center justify-center'>
                    <Image 
                        className='h-10 w-10' 
                        src={GoogleImg} alt='google-icon' 
                        width={50} 
                        height={50} 
                        title='login with google'
                    />
                </div>
            </a>
      </form>
    </div>
  );
};

export default LoginPage;