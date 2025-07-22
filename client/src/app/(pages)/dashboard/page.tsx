'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import { AddHoldingModal } from '@/app/components/dashboard/holdingModal';
import ProfileCard from '@/app/components/dashboard/ProfileCard';

// Define the type for a user profile
interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

// // ... (Keep the Holding interface and AddHoldingModal component as they were)
interface Holding {
  id: string;
  coinId: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalProfitLoss: number;
}

// const AddHoldingModal = ({ isOpen, setIsOpen, onHoldingAdded }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; onHoldingAdded: () => void; }) => {
//   // ... (Modal code remains the same)
//   const [coinId, setCoinId] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [buyPrice, setBuyPrice] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const API_URL = process.env.NEXT_PUBLIC_API_URL;
//       await axios.post(`${API_URL}/api/portfolio/holdings`, {
//         coinId: coinId.toLowerCase(),
//         quantity: parseFloat(quantity),
//         buyPrice: parseFloat(buyPrice),
//       });
//       toast.success('Coin added to portfolio!');
//       onHoldingAdded();
//       setIsOpen(false);
//       setCoinId('');
//       setQuantity('');
//       setBuyPrice('');
//     } catch (error) {
//       toast.error('Failed to add coin. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
//         {/* ... (rest of the modal JSX is unchanged) */}
//         <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
//           <div className="fixed inset-0 bg-black bg-opacity-50" />
//         </Transition.Child>
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
//               <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
//                 <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">Add New Coin</Dialog.Title>
//                 <form onSubmit={handleSubmit} className="mt-4">
//                   <div className="mb-4"><label className="block text-sm font-medium text-gray-400">Coin ID (e.g., bitcoin, ethereum)</label><input type="text" value={coinId} onChange={(e) => setCoinId(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:bg-gray-600 focus:ring-0 text-white" required /></div>
//                   <div className="mb-4"><label className="block text-sm font-medium text-gray-400">Quantity</label><input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:bg-gray-600 focus:ring-0 text-white" required /></div>
//                   <div className="mb-4"><label className="block text-sm font-medium text-gray-400">Buy Price (USD)</label><input type="number" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-blue-500 focus:bg-gray-600 focus:ring-0 text-white" required /></div>
//                   <div className="mt-6"><button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" disabled={isSubmitting}>{isSubmitting ? <FaSpinner className="animate-spin" /> : 'Add Holding'}</button><button type="button" className="ml-4 inline-flex justify-center rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700" onClick={() => setIsOpen(false)}>Cancel</button></div>
//                 </form>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };


const DashboardPage = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null); // State for user profile
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        // Fetch both portfolio and user profile data at the same time
        const [portfolioRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/portfolio`),
          axios.get(`${API_URL}/api/auth/me`)
        ]);
        setHoldings(portfolioRes.data);
        setUser(userRes.data.user);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Could not load your dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, router]);

  const fetchPortfolio = async () => {
    // This function can now be simplified to only refetch holdings
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${API_URL}/api/portfolio`);
      setHoldings(response.data);
    } catch (error) {
      toast.error('Could not refresh your portfolio.');
    }
  };

  const deleteHolding = async (holdingId: string) => {
    // ... (deleteHolding function remains the same)
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        await axios.delete(`${API_URL}/api/portfolio/holdings/${holdingId}`);
        toast.success('Holding deleted!');
        fetchPortfolio();
    } catch (error) {
        toast.error('Failed to delete holding.');
    }
  }

  if (!token || isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><FaSpinner className="animate-spin text-4xl" /></div>;
  }

  const totalPortfolioValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);

  return (
    <>
      <Toaster position="top-right" />
      <AddHoldingModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onHoldingAdded={fetchPortfolio} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Add the ProfileCard at the top */}
        <div className="mb-8">
          <ProfileCard user={user} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-gray-400">Total Value: <span className="text-green-400 font-semibold">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add New Coin
          </button>
        </div>

        {/* ... (The rest of the table and holdings display remains the same) */}
        {holdings.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Your portfolio is empty.</p>
            <p className="text-gray-500 text-sm">Click &quot;Add New Coin &quot;to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead><tr className="border-b border-gray-700"><th className="text-left p-4">Coin</th><th className="text-right p-4">Price</th><th className="text-right p-4">Holdings</th><th className="text-right p-4">P/L</th><th className="text-right p-4">Actions</th></tr></thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4 font-medium capitalize">{h.coinId}</td>
                    <td className="text-right p-4">${h.currentPrice.toLocaleString()}</td>
                    <td className="text-right p-4"><div>${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div className="text-xs text-gray-400">{h.quantity} {h.coinId.slice(0, 3).toUpperCase()}</div></td>
                    <td className={`text-right p-4 font-semibold ${h.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>${h.totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right p-4"><button onClick={() => deleteHolding(h.id)} className="text-red-500 hover:text-red-400"><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;