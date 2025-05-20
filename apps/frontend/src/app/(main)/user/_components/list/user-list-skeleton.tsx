'use client';

import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a generic Skeleton component

export function UserListPageSkeleton() {
  return (
    <div className='container mx-auto p-4'>
      {/* Skeleton for UserListHeader */}
      <div className='mb-4 flex items-center justify-between'>
        <Skeleton className='h-8 w-32' /> {/* Placeholder for title */}
        <Skeleton className='h-10 w-24' />{' '}
        {/* Placeholder for Add User button */}
      </div>

      {/* Skeleton for UserFilters */}
      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          <div className='flex-1'>
            <Skeleton className='mb-1 h-4 w-1/4' /> {/* Label for user input */}
            <Skeleton className='h-10 w-full' />{' '}
            {/* Placeholder for user input */}
          </div>
          <div className='flex-1'>
            <Skeleton className='mb-1 h-4 w-1/4' />{' '}
            {/* Label for status filter */}
            <Skeleton className='h-10 w-full' />{' '}
            {/* Placeholder for status filter */}
          </div>
          <div className='flex items-end'>
            <Skeleton className='h-10 w-24' />{' '}
            {/* Placeholder for Clear Filters button */}
          </div>
        </div>
      </div>

      {/* Skeleton for UserTable */}
      <div className='rounded-xl border bg-white'>
        {/* Table Header Skeleton */}
        <div className='flex border-b p-4'>
          <Skeleton className='h-6 flex-1' />
          <Skeleton className='ml-4 h-6 flex-1' />
          <Skeleton className='ml-4 h-6 flex-1' />
          <Skeleton className='ml-4 h-6 w-20' /> {/* Actions column */}
        </div>

        {/* Table Body Skeleton - Repeat for a few rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center border-b p-4'>
            <Skeleton className='h-5 flex-1' />
            <Skeleton className='ml-4 h-5 flex-1' />
            <Skeleton className='ml-4 h-5 flex-1' />
            <div className='ml-4 flex w-20 space-x-2'>
              <Skeleton className='h-8 w-8 rounded-md' /> {/* Edit button */}
              <Skeleton className='h-8 w-8 rounded-md' /> {/* Delete button */}
            </div>
          </div>
        ))}

        {/* Table Pagination Skeleton */}
        <div className='flex items-center justify-between p-4'>
          <Skeleton className='h-8 w-32' /> {/* Items per page */}
          <div className='flex space-x-2'>
            <Skeleton className='h-8 w-20' /> {/* Page info */}
            <Skeleton className='h-8 w-8' /> {/* Prev button */}
            <Skeleton className='h-8 w-8' /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  );
}
