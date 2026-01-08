'use client';

import React from 'react';
import { Construction, User, Target, CheckCircle } from 'lucide-react';

export default function UnderConstruction() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <header className='mb-10 text-center'>
          <div className='bg-accent/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
            <Construction className='text-accent h-10 w-10' />
          </div>

          <h1 className='mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100'>
            Desenvolvimento futuro
          </h1>

          <p className='text-lg text-gray-600 dark:text-gray-300'>
            Este módulo será desenvolvido em um momento futuro.
          </p>
        </header>

        {/* Content */}
        <section className='grid gap-6 md:grid-cols-2'>
          {/* Card 1 */}
          <div className='rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-700'>
            <div className='mb-4 flex items-center gap-3'>
              <User className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                Módulo
              </h2>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Esta página faz parte de um módulo a ser desenvolvido.
            </p>
          </div>

          {/* Card 2 */}
          {/* <div className='rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-700'>
            <div className='mb-4 flex items-center gap-3'>
              <Target className='h-6 w-6 text-green-600 dark:text-green-400' />
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                Objetivo
              </h2>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Centralizar informações e funcionalidades de forma clara,
              organizada e alinhada às necessidades do sistema.
            </p>
          </div> */}

          {/* Card 3 */}
          <div className='rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-700'>
            <div className='mb-4 flex items-center gap-3'>
              <CheckCircle className='h-6 w-6 text-purple-600 dark:text-purple-400' />
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                Status
              </h2>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Modelagem do esquema definida. Próximas etapas incluem
              implementação de funcionalidades e testes no frontend.
            </p>
          </div>
        </section>

        {/* Footer hint */}
        <footer className='mt-12 text-center text-sm text-gray-500 dark:text-gray-400'>
          © {new Date().getFullYear()} • Conteúdo fora do escopo inicial
        </footer>
      </div>
    </main>
  );
}
