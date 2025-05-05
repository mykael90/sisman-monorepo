'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  ListChecks,
  Users,
  Building2,
  Truck,
  UserRound,
  ArrowRight
} from 'lucide-react'; // Import icons from Lucide

interface Photo {
  id: number;
  url: string;
  alt: string;
}

interface CardData {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>; // Icon component type
}

const cardData: CardData[] = [
  {
    title: 'Materiais',
    description: 'Gerencie seus materiais de forma eficiente.',
    href: '/material',
    icon: ListChecks
  },
  {
    title: 'Colaboradores',
    description: 'Acompanhe seus colaboradores e suas funções.',
    href: '/colaboradores',
    icon: Users
  },
  {
    title: 'Equipamentos',
    description: 'Controle seus equipamentos e seus status.',
    href: '/equipamentos',
    icon: Building2
  },
  {
    title: 'Infraestrutura',
    description: 'Gerencie suas infraestruturas.',
    href: '/infraestrutura',
    icon: Home
  },
  {
    title: 'Fornecedores',
    description: 'Gerencie seus fornecedores.',
    href: '/fornecedores',
    icon: UserRound
  },
  {
    title: 'Frota',
    description: 'Gerencie sua frota.',
    href: '/frota',
    icon: Truck
  }
];

export default function Inicio() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const newPhotos: Photo[] = [];
        for (let i = 0; i < 10; i++) {
          const width = 1600;
          const height = 900;
          const imageUrl = `https://picsum.photos/${width}/${height}?random=${i}`; // Get a random image with a unique seed
          const response = await fetch(`https://picsum.photos/id/${i}/info`);
          const data = await response.json();
          newPhotos.push({
            id: data.id,
            url: imageUrl,
            alt: `Imagem de natureza ${i + 1}`
          });
        }
        setPhotos(newPhotos);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex(prevIndex =>
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [photos]);

  const handlePrevClick = () => {
    setCurrentPhotoIndex(prevIndex =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentPhotoIndex(prevIndex =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <main className='flex w-full flex-col p-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-800 dark:text-gray-200'>
        Bem-vindo ao SisMan!
      </h1>

      {/* Carousel Section */}
      <section className='mb-8'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300'>
          Destaques
        </h2>
        <div className='relative w-full overflow-hidden rounded-lg shadow-md'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
              <div className='h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-blue-500'></div>
            </div>
          )}
          {error && (
            <div className='absolute inset-0 flex items-center justify-center bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200'>
              {error}
            </div>
          )}
          {photos.length > 0 && (
            <>
              <div
                className='transition-transform duration-500 ease-in-out'
                style={{
                  transform: `translateX(-${currentPhotoIndex * 100}%)`,
                  display: 'flex'
                }}
              >
                {photos.map(photo => (
                  <div key={photo.id} className='w-full flex-shrink-0'>
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className='h-96 w-full object-cover'
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handlePrevClick}
                className='bg-opacity-50 hover:bg-opacity-75 absolute top-1/2 left-2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
              </button>
              <button
                onClick={handleNextClick}
                className='bg-opacity-50 hover:bg-opacity-75 absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Cards Section */}
      <section className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {cardData.map((card, index) => (
          <div
            key={index}
            className='group relative rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105 dark:bg-gray-800'
          >
            <div className='bg-sisman-green group-hover:bg-sisman-blue dark:bg-sisman-blue dark:group-hover:bg-sisman-green absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-colors'>
              <card.icon className='h-6 w-6' />
            </div>
            <h3 className='mt-8 mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300'>
              {card.title}
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {card.description}
            </p>
            <a
              href={card.href}
              className='mt-4 inline-flex items-center text-blue-500 hover:underline'
            >
              Ver Mais
              <ArrowRight className='ml-1 h-4 w-4' />
            </a>
          </div>
        ))}
      </section>
    </main>
  );
}
