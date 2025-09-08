// src/components/MediaCarouselViewer.tsx
'use client'; // Necessário se você estiver usando Next.js App Router e hooks

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Para otimização de imagens no Next.js
import { PlayCircle, X } from 'lucide-react'; // Ícones para indicar vídeo e fechar

// Importar componentes Shadcn UI
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi // Importe o tipo CarouselApi
} from '@/components/ui/carousel';
// O Card não é estritamente necessário para este viewer, mas pode ser usado para envolver
// import { Card, CardContent } from '@/components/ui/card';

// Importar a interface IMediaFile
import { IMediaFile } from '@/types/media'; // Ajuste o caminho conforme onde você salvou a interface

interface MediaCarouselViewerProps {
  /**
   * An array of media files to display.
   */
  files: IMediaFile[];
  /**
   * A function that takes a relative file URL (from `MediaFile.url`)
   * and returns its public accessible URL.
   */
  getPublicFileUrl: (relativePath: string) => string | undefined;
  /**
   * Optional: The index of the file to start the carousel at.
   * @default 0
   */
  initialIndex?: number;
  /**
   * Optional: Callback function to close the viewer. Useful when used within a modal.
   */
  onClose?: () => void;
}

const MediaCarouselViewer: React.FC<MediaCarouselViewerProps> = ({
  files,
  getPublicFileUrl,
  initialIndex = 0,
  onClose
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 0-indexed for internal logic

  // Define extensões comuns para imagens e vídeos que este viewer deve exibir
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

  // Filtra apenas os arquivos que são imagens ou vídeos e são "playáveis" neste viewer
  const playableMediaFiles = files.filter(
    (file) =>
      file.extension &&
      (imageExtensions.includes(file.extension.toLowerCase()) ||
        videoExtensions.includes(file.extension.toLowerCase()))
  );

  const totalSlides = playableMediaFiles.length;

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    // Initialize the carousel to the initialIndex
    if (initialIndex >= 0 && initialIndex < totalSlides) {
      carouselApi.scrollTo(initialIndex, true); // `true` for instant scroll
    }

    // Update currentSlideIndex when carousel selection changes
    carouselApi.on('select', () => {
      setCurrentSlideIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi, initialIndex, totalSlides]);

  // Handler para quando uma miniatura é clicada
  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (carouselApi) {
        carouselApi.scrollTo(index);
      }
    },
    [carouselApi]
  );

  // Função para renderizar a mídia principal (imagem ou vídeo grande)
  const renderMainMedia = useCallback(
    (file: IMediaFile, index: number) => {
      const publicUrl = getPublicFileUrl(file.url);
      if (!publicUrl) {
        return (
          <div className='flex h-full w-full items-center justify-center bg-gray-800 text-red-400'>
            Failed to load media: {file.fileName || file.url}
          </div>
        );
      }

      const isImage = imageExtensions.includes(file.extension.toLowerCase());
      const isVideo = videoExtensions.includes(file.extension.toLowerCase());
      const altText = file.description || file.fileName || `Media ${index + 1}`;

      return (
        <div className='relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-900'>
          {isImage && (
            <Image
              src={publicUrl}
              alt={altText}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw'
              style={{ objectFit: 'contain' }} // Para que a imagem caiba inteira
              className='object-contain'
              priority={index === initialIndex} // Otimiza a carga da imagem inicial
            />
          )}
          {isVideo && (
            <video
              src={publicUrl}
              controls // Mostra os controles de reprodução
              preload='auto' // Sugere ao navegador para carregar o vídeo para uma reprodução mais rápida
              className='h-full w-full object-contain'
              poster={file.thumbnailUrl || undefined} // Usa a thumbnail como poster se disponível
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Hierarquia de estilos para Nome do Arquivo e Descrição */}
          <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white'>
            {file.fileName && (
              <p className='mb-1 truncate text-xl font-semibold text-white'>
                {file.fileName}
              </p>
            )}
            {file.description && (
              <p className='line-clamp-2 text-sm text-gray-300'>
                {file.description}
              </p>
            )}
          </div>
        </div>
      );
    },
    [getPublicFileUrl, imageExtensions, videoExtensions, initialIndex]
  );

  // Função para renderizar uma miniatura individual
  const renderThumbnail = useCallback(
    (file: IMediaFile, index: number) => {
      const publicUrl = getPublicFileUrl(file.url);
      if (!publicUrl) return null;

      const isImage = imageExtensions.includes(file.extension.toLowerCase());
      const isVideo = videoExtensions.includes(file.extension.toLowerCase());

      const isActive = currentSlideIndex === index; // Verifica se esta miniatura é a ativa

      return (
        <div
          key={file.url + index}
          className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-200 ${
            isActive
              ? 'scale-105 border-blue-500'
              : 'border-transparent opacity-70 hover:opacity-100'
          }`}
          onClick={() => handleThumbnailClick(index)}
        >
          {isImage && (
            <Image
              src={publicUrl}
              alt={file.fileName || `Thumbnail ${index + 1}`}
              fill
              sizes='80px'
              style={{ objectFit: 'cover' }}
              className='transition-transform duration-200 group-hover:scale-105'
            />
          )}
          {isVideo && (
            <>
              {file.thumbnailUrl ? (
                <Image
                  src={file.thumbnailUrl}
                  alt={file.fileName || `Video Thumbnail ${index + 1}`}
                  fill
                  sizes='80px'
                  style={{ objectFit: 'cover' }}
                  className='transition-transform duration-200 group-hover:scale-105'
                />
              ) : (
                <video
                  src={publicUrl}
                  preload='metadata' // Carrega apenas metadados para obter o primeiro frame
                  className='h-full w-full object-cover'
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {/* Overlay com ícone de reprodução para vídeos */}
              <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black text-white opacity-90'>
                <PlayCircle size={24} />
              </div>
            </>
          )}
        </div>
      );
    },
    [
      getPublicFileUrl,
      imageExtensions,
      videoExtensions,
      currentSlideIndex,
      handleThumbnailClick
    ]
  );

  if (totalSlides === 0) {
    return (
      <div className='flex h-60 items-center justify-center rounded-lg bg-white p-4 text-gray-500 shadow-md'>
        No playable media files to display.
      </div>
    );
  }

  return (
    <div className='relative mx-auto h-full w-full max-w-5xl rounded-lg bg-white p-4 shadow-xl sm:p-6'>
      {/* Botão de Fechar (útil para uso em modal) */}
      {onClose && (
        <button
          onClick={onClose}
          className='absolute top-2 right-2 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:outline-none'
          aria-label='Close media viewer'
        >
          <X size={20} />
        </button>
      )}

      {/* Carrossel Principal */}
      <Carousel setApi={setCarouselApi} className='mb-4 w-full'>
        <div className='relative h-[calc(70vh-8rem)] min-h-[300px] w-full overflow-hidden rounded-md bg-gray-900'>
          <CarouselContent className='h-full'>
            {playableMediaFiles.map((file, index) => (
              <CarouselItem
                key={`main-${file.url}-${index}`}
                className='h-full'
              >
                {renderMainMedia(file, index)}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='absolute top-1/2 left-2 z-10 -translate-y-1/2' />
          <CarouselNext className='absolute top-1/2 right-2 z-10 -translate-y-1/2' />
        </div>
        <div className='mt-2 text-center text-sm text-gray-500'>
          {currentSlideIndex + 1} of {totalSlides}
        </div>
      </Carousel>

      {/* Miniaturas de Navegação */}
      <div className='custom-scrollbar mt-4 flex max-h-[120px] flex-wrap justify-center gap-2 overflow-y-auto'>
        {playableMediaFiles.map((file, index) => renderThumbnail(file, index))}
      </div>
    </div>
  );
};

export default MediaCarouselViewer;
