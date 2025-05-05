// src/components/ui/button-signin-skeleton.tsx
import React from 'react';

/**
 * Skeleton component for SignInButton.
 * Mimics the appearance of the logged-in user state (avatar + name placeholder)
 * while session data is loading.
 */
const SignInButtonSkeleton = () => {
  return (
    <div
      className='flex h-10 items-center gap-2' // Ensure height matches the original trigger area
      aria-hidden='true' // Hide from screen readers as it's decorative
      aria-label='Loading user information' // Provide label for assistive tech if needed
    >
      {/* Skeleton for UserAvatar */}
      <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700'></div>

      {/* Skeleton for the name span */}
      <div className='hidden h-4 w-24 animate-pulse rounded bg-gray-200 sm:block dark:bg-gray-700'></div>

      {/* Mobile view: Only avatar might be visible, so the above covers it.
          If you need a specific mobile skeleton, adjust accordingly. */}
    </div>
  );
};

export default SignInButtonSkeleton;
