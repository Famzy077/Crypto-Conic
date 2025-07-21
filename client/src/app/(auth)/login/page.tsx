'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/authContext';
import Image from 'next/image';
import * as Yup from 'yup';
import { Toaster, toast } from 'react-hot-toast';

import GoogleImg from '../../../../public/image/googleIcon.png';
import loginImage from '../../../../public/image/loginImage3.png';
import { FaSpinner } from 'react-icons/fa';

// Define the validation schema with Yup
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
      
      // If validation is successful, proceed with login
      await loginUser({ email, password });
      toast.success('Login successful!');

    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        // Handle Yup validation errors
        const yupErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            yupErrors[error.path] = error.message;
          }
        });
        setErrors(yupErrors);
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex mt-18 max-sm:mt-14 items-center gap-5 max-sm:px-5 pr-8 justify-between min-h-screen bg-gray-900">
        <div className='max-md:hidden lg:w-[140%]'>
          <Image 
            className='h-[100vh] w-[120%] brightness-60 object-cover' 
            src={loginImage} 
            alt='login illustration'
            title='login image'
          />
        </div>
        <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-xl container m-auto max-sm:w-[100%] max-md:w-[65%] lg:w-[100%]">
          <h2 className="text-2xl max-sm:text-xl text-center font-bold text-white">Welcome Back</h2>
          <p className='text-[17px] max-sm:text-sm mb-5 text-center'>Please enter your credentials to login</p>
          
          <div className="mb-4">
            <label className="block max-sm:text-sm text-gray-400 mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 rounded bg-gray-700 text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block max-sm:text-sm text-gray-400 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 rounded bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : 'Login'}
          </button>

          <a href={`${API_URL}/api/auth/google`}>
            <div className='border py-1 rounded transition duration-300 mt-3 flex items-center justify-center hover:bg-gray-700'>
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
    </>
  );
};

export default LoginPage;