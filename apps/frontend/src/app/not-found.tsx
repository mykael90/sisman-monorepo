import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className='flex h-[calc(100vh-7rem)] w-full flex-col items-center justify-center p-8'>
      <h1 className='mb-4 text-6xl font-bold text-gray-800 dark:text-gray-200'>
        404
      </h1>
      <p className='mb-8 text-xl text-gray-600 dark:text-gray-400'>
        Oops! Página não encontrada.
      </p>
      <Link
        href='/'
        className='flex items-center text-blue-500 hover:underline'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Voltar para a página inicial
      </Link>
    </main>
  );
}
