// src/components/MediaCarouselViewer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PlayCircle, X } from 'lucide-react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';

import { IMediaFile } from '@/types/media';

interface MediaCarouselViewerProps {
  files: IMediaFile[];
  getPublicFileUrl: (relativePath: string) => string | undefined;
  initialIndex?: number;
  onClose?: () => void;
}

const MediaCarouselViewer: React.FC<MediaCarouselViewerProps> = ({
  files,
  getPublicFileUrl,
  initialIndex = 0,
  onClose
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

  const playableMediaFiles = files.filter(
    (file) =>
      file.extension &&
      (imageExtensions.includes(file.extension.toLowerCase()) ||
        videoExtensions.includes(file.extension.toLowerCase()))
  );

  const totalSlides = playableMediaFiles.length;

  useEffect(() => {
    if (!carouselApi || totalSlides === 0) {
      return;
    }

    const safeInitialIndex = Math.min(
      Math.max(0, initialIndex),
      totalSlides - 1
    );

    carouselApi.scrollTo(safeInitialIndex, true);
    setCurrentSlideIndex(safeInitialIndex);

    const handleSelect = () => {
      setCurrentSlideIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, initialIndex, totalSlides]);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (carouselApi) {
        carouselApi.scrollTo(index);
      }
    },
    [carouselApi]
  );

  const renderMainMedia = useCallback(
    (file: IMediaFile, index: number) => {
      const publicUrl = getPublicFileUrl(file.url);
      const isCurrentSlide = index === currentSlideIndex;

      if (!publicUrl) {
        console.error(
          `[MediaCarouselViewer] Erro: URL pública vazia para o arquivo: ${file.fileName || file.url}`
        );
        return (
          <div className='relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-gray-800 text-red-400'>
            Falha ao carregar mídia: {file.fileName || file.url} - URL inválida
            ou vazia.
          </div>
        );
      }

      const isImage = imageExtensions.includes(file.extension.toLowerCase());
      const isVideo = videoExtensions.includes(file.extension.toLowerCase());
      const altText = file.description || file.fileName || `Media ${index + 1}`;

      return (
        <div className='relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-gray-900'>
          <div className='relative flex h-full w-full items-center justify-center px-4'>
            {isImage && (
              <Image
                key={publicUrl}
                src={publicUrl}
                alt={altText}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw'
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                priority={isCurrentSlide}
                loading={isCurrentSlide ? 'eager' : 'lazy'}
                onError={(e) => {
                  console.error(
                    `[MediaCarouselViewer] Erro ao carregar imagem principal: ${publicUrl}. `,
                    e.currentTarget.src,
                    e
                  );
                }}
                onLoadingComplete={(img) => {
                  console.log(
                    `[MediaCarouselViewer] Imagem ${publicUrl} carregada completamente (dimensões: ${img.naturalWidth}x${img.naturalHeight}).`
                  );
                }}
              />
            )}
            {isVideo && (
              <video
                src={publicUrl}
                controls
                preload={isCurrentSlide ? 'auto' : 'metadata'}
                className='h-full w-full object-contain'
                poster={file.thumbnailUrl || undefined}
                onError={(e) => {
                  console.error(
                    `[MediaCarouselViewer] Erro ao carregar vídeo principal: ${publicUrl}.`,
                    e.currentTarget.src,
                    e
                  );
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Hierarquia de estilos para Nome do Arquivo e Descrição - MOVIDO PARA O TOPO */}
          <div className='absolute top-0 right-0 left-0 bg-gradient-to-b from-black/80 to-transparent p-4 text-white'>
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
    [getPublicFileUrl, imageExtensions, videoExtensions, currentSlideIndex]
  );

  const renderThumbnail = useCallback(
    (file: IMediaFile, index: number) => {
      const publicUrl = getPublicFileUrl(file.url);
      if (!publicUrl) return null;

      const isImage = imageExtensions.includes(file.extension.toLowerCase());
      const isVideo = videoExtensions.includes(file.extension.toLowerCase());

      const isActive = currentSlideIndex === index;

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
              key={publicUrl + '-thumb'}
              src={publicUrl}
              alt={file.fileName || `Thumbnail ${index + 1}`}
              fill
              sizes='80px'
              style={{ objectFit: 'cover' }}
              className='transition-transform duration-200 group-hover:scale-105'
              loading='lazy'
            />
          )}
          {isVideo && (
            <>
              {file.thumbnailUrl ? (
                <Image
                  key={file.thumbnailUrl || publicUrl + '-video-thumb'}
                  src={file.thumbnailUrl}
                  alt={file.fileName || `Video Thumbnail ${index + 1}`}
                  fill
                  sizes='80px'
                  style={{ objectFit: 'cover' }}
                  className='transition-transform duration-200 group-hover:scale-105'
                  loading='lazy'
                />
              ) : (
                <video
                  src={publicUrl}
                  preload='metadata'
                  className='h-full w-full object-cover'
                >
                  Your browser does not support the video tag.
                </video>
              )}
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
      {onClose && (
        <button
          onClick={onClose}
          className='absolute top-2 right-2 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:outline-none'
          aria-label='Close media viewer'
        >
          <X size={20} />
        </button>
      )}

      <Carousel setApi={setCarouselApi} className='mb-4 w-full'>
        <CarouselContent className='relative ml-0 flex h-[calc(70vh-8rem)] min-h-[300px] w-full rounded-md bg-gray-900'>
          {playableMediaFiles.map((file, index) => (
            <CarouselItem
              key={`main-${file.url}-${index}`}
              className='flex h-full basis-full items-stretch pl-0'
            >
              {renderMainMedia(file, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='absolute top-1/2 left-2 z-10 -translate-y-1/2' />
        <CarouselNext className='absolute top-1/2 right-2 z-10 -translate-y-1/2' />
        <div className='mt-2 text-center text-sm text-gray-500'>
          {currentSlideIndex + 1} of {totalSlides}
        </div>
      </Carousel>

      <div className='custom-scrollbar flex max-h-[120px] min-h-[82px] flex-wrap justify-center gap-2 overflow-y-auto'>
        {playableMediaFiles.map((file, index) => renderThumbnail(file, index))}
      </div>
    </div>
  );
};

export default MediaCarouselViewer;
