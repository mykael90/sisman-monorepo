import { UserPlus } from 'lucide-react';
import React from 'react';

function UserHeader() {
  return (
    <div className='border-b'>
      <div className='px-6 pt-6 pb-5'>
        {' '}
        {/* Consistent horizontal padding, adjusted vertical for balance */}
        <div className='flex items-center'>
          <div className='flex items-center text-green-600'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
              <UserPlus className='h-5 w-5' />
            </div>
            <h2 className='ml-3 text-xl font-bold'>New User</h2>{' '}
            {/* Increased ml slightly for better spacing from icon bg */}
          </div>
        </div>
        <p className='mt-2 text-sm text-gray-600'>
          Add a new user to the system
        </p>
      </div>
      <div className='ml-6 h-1 w-1/4 bg-green-600'></div>{' '}
      {/* Accent underline, aligned with px-6 content */}
    </div>
  );
}

export { UserHeader };
