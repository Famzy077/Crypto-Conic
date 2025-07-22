'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/authContext';
import Image from 'next/image';
import Link from 'next/link';
import * as Yup from 'yup';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios'; // Import axios to check for specific API errors

import GoogleImg from '../../../../public/image/googleIcon.png';
import loginImage from '../../../../public/image/loginImage3.png';
import { FaSpinner } from 'react-icons/fa';

// Define the validation schema with Yup
const registerSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Corrected: Use `registerUser` for the registration page
  const { registerUser } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Clear previous errors on a new submission

    try {
      // 1. Validate form data on the client-side first
      await registerSchema.validate({ email, password }, { abortEarly: false });
      
      // 2. If validation succeeds, call the register function
      await registerUser({ email, password });
      toast.success('Registration successful! Redirecting...');

    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        // Handle client-side Yup validation errors
        const yupErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            yupErrors[error.path] = error.message;
          }
        });
        setErrors(yupErrors);
      } else if (axios.isAxiosError(err) && err.response) {
        // Handle server-side errors from the API
        const serverMessage = err.response.data.message || 'Registration failed. Please try again.';
        toast.error(serverMessage); // Show a toast notification with the specific server message

        // If the error is about an existing user, set a specific field error to guide the user
        if (serverMessage.toLowerCase().includes('already exists')) {
          setErrors({ email: 'This email is already registered.' });
        }
      } else {
        // Handle other unexpected errors (e.g., network issues)
        toast.error('An unexpected error occurred. Please check your connection.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Add the Toaster component to render notifications */}
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
          <Link href="/" className="font-bold text-blue-400 flex items-center justify-center">
            <Image src={'/image/logo.png'} alt='logo' width={100} height={100} className='max-sm:w-[90px] w-[120px] max-sm:h-[60px] h-[75px]' title='logo image'/>
            <h2 className='transform max-sm text-2xl -translate-x-6'>CryptoCronic</h2>
          </Link>
          <h2 className="text-2xl font-bold text-white text-center">Create Account</h2>
          <p className='text-[17px] max-sm:text-sm mb-5 text-center'>Welcome to CryptoCronic</p>
          
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 rounded bg-gray-700 text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
            />
            {/* Display the email error message if it exists */}
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 rounded bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
            />
            {/* Display the password error message if it exists */}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {/* Show a spinner when loading, otherwise show the text */}
            {isLoading ? <FaSpinner className="animate-spin" /> : 'Register'}
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

export default RegisterPage;