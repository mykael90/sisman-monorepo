'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Target } from 'lucide-react';

interface Photo {
  url: string;
  alt: string;
}

export default function About() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      const newPhotos: Photo[] = [];
      for (let i = 0; i < 3; i++) {
        const width = 800;
        const height = 400;
        const randomId = Math.floor(Math.random() * 1000);
        const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
        newPhotos.push({ url, alt: `Imagem ilustrativa ${i + 1}` });
      }
      setPhotos(newPhotos);
    };

    fetchPhotos();
  }, []);

  return (
    <main className='flex flex-col p-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-800 dark:text-gray-200'>
        Sobre o Projeto
      </h1>

      {/* Hero Section with Picsum Image */}
      <section className='relative mb-8'>
        {photos.length > 0 && (
          <img
            src={photos[currentPhotoIndex].url}
            alt={photos[currentPhotoIndex].alt}
            className='h-96 w-full rounded-lg object-cover shadow-lg'
          />
        )}
      </section>

      {/* Idealizador Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <User className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Idealizador
          </h2>
        </div>
        <p className='text-gray-600 dark:text-gray-400'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </section>

      {/* Justificativas Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <CheckCircle className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Justificativas
          </h2>
        </div>
        <ul className='list-inside list-disc text-gray-600 dark:text-gray-400'>
          <li>Razão 1: Lorem ipsum dolor sit amet.</li>
          <li>Razão 2: Consectetur adipiscing elit.</li>
          <li>Razão 3: Sed do eiusmod tempor incididunt.</li>
        </ul>
      </section>

      {/* Objetivos Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <Target className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Objetivos
          </h2>
        </div>
        <ul className='list-inside list-disc text-gray-600 dark:text-gray-400'>
          <li>Objetivo 1: Lorem ipsum dolor sit amet.</li>
          <li>Objetivo 2: Consectetur adipiscing elit.</li>
          <li>Objetivo 3: Sed do eiusmod tempor incididunt.</li>
        </ul>
      </section>
    </main>
  );
}
