import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  className?: string;
  size?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | '8xl'
    | '9xl'; // New size prop
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  name,
  className,
  size = 'md' // Default size is medium
}) => {
  const getInitials = (name: string | null | undefined): string => {
    if (!name) {
      return 'U';
    }

    const names = name.split(' ');
    const firstNameInitial = names[0]?.charAt(0).toUpperCase() || '';
    const lastNameInitial =
      names.length > 1
        ? names[names.length - 1]?.charAt(0).toUpperCase() || ''
        : '';

    return `${firstNameInitial}${lastNameInitial}`;
  };

  const avatarSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20',
    '3xl': 'h-24 w-24',
    '4xl': 'h-28 w-28',
    '5xl': 'h-32 w-32',
    '6xl': 'h-36 w-36',
    '7xl': 'h-40 w-40',
    '8xl': 'h-44 w-44',
    '9xl': 'h-48 w-48'
  };

  const avatarClass = avatarSizeClasses[size] || avatarSizeClasses['md'];

  return (
    <Avatar className={`${avatarClass} ${className}`}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt={name || 'User'}
          className='rounded-full'
        />
      ) : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
