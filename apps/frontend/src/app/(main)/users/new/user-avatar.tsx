'use client';

import type React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface UserAvatarProps {
  onAvatarChange: (url: string) => void;
  initialAvatarUrl?: string;
}

export function UserAvatar({
  onAvatarChange,
  initialAvatarUrl
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For this example, we'll create a local URL
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      onAvatarChange(url);
    }
  };

  return (
    <div className='relative'>
      <div className='h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100'>
        {avatarUrl ? (
          <Image
            src={avatarUrl || '/placeholder.svg'}
            alt='User avatar'
            width={96}
            height={96}
            className='h-full w-full object-cover'
          />
        ) : (
          <Image
            src='/placeholder.svg?height=96&width=96'
            alt='Default avatar'
            width={96}
            height={96}
            className='h-full w-full object-cover'
          />
        )}
      </div>
      <label
        htmlFor='avatar-upload'
        className='absolute right-0 bottom-0 cursor-pointer rounded-full bg-green-600 p-1 text-white'
      >
        <Camera className='h-4 w-4' />
        <input
          id='avatar-upload'
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleAvatarChange}
        />
      </label>
      <p className='mt-2 text-center text-sm text-green-600'>
        Upload a profile picture
      </p>
    </div>
  );
}
