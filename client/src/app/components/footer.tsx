import Link from 'next/link';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';
import logoImg from '../../../../public/image/logo.png';

const Footers = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-left">
          <div>
            <Link href="/" className=" font-bold text-blue-400 flex items-center">
              <Image src={logoImg} alt='logo' className='max-sm:w-[90px] w-[120px] max-sm:h-[60px] h-[75px]' title='logo image'/>
              <h2 className='transform max-sm text-2xl -translate-x-6'>CryptoCronic</h2>
            </Link>

            <p className="text-sm">
              Your all-in-one solution for tracking your cryptocurrency portfolio and staying updated with the latest market news.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/news" className="hover:text-blue-400 transition-colors">News</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaTwitter size={24} /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaGithub size={24} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaLinkedin size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CryptoCronic. Created by Akinola Femi. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footers;