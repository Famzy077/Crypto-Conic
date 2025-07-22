'use client';

import Image from 'next/image';

interface UserProfile {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

const ProfileCard = ({ user }: { user: UserProfile | null }) => {
  if (!user) {
    // Return a skeleton loader here for a better UX
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-700 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <main className='flex justify-start'>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
                <Image
                src={user.avatarUrl || '/default-avatar.png'} // Use a default avatar if none is provided
                alt={user.name || 'User Avatar'}
                width={48}
                height={48}
                className="rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                />
                <div>
                <h2 className="text-lg font-semibold text-white">{user.name || 'Welcome!'}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
                </div>
            </div>
        </div>
    </main>
  );
};

export default ProfileCard;