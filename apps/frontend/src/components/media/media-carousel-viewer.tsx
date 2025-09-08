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

      // Debugging: Log URLs to ensure they are valid for all slides
      // console.log(`[Viewer] Slide ${index}: Public URL = ${publicUrl}, Active = ${isCurrentSlide}`);

      if (!publicUrl) {
        // console.error(`[Viewer Error] No public URL for file: ${file.fileName || file.url}`);
        return (
          <div className='relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-gray-800 text-red-400'>
            Failed to load media: {file.fileName || file.url} - URL invalid or
            empty.
          </div>
        );
      }

      const isImage = imageExtensions.includes(file.extension.toLowerCase());
      const isVideo = videoExtensions.includes(file.extension.toLowerCase());
      const altText = file.description || file.fileName || `Media ${index + 1}`;

      return (
        <div className='relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-gray-900'>
          {isImage && (
            <Image
              // CRUCIAL: Add a unique key to force remount/re-evaluation of the Image component
              // when the publicUrl (and thus the image content) changes.
              key={publicUrl}
              src={publicUrl}
              alt={altText}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw'
              style={{ objectFit: 'contain' }}
              className='object-contain'
              // Apply priority/eager loading only for the current active slide
              priority={isCurrentSlide}
              loading={isCurrentSlide ? 'eager' : 'lazy'}
            />
          )}
          {isVideo && (
            <video
              // It's generally not recommended to add a key to <video> unless its src is changing frequently,
              // as browser can handle src changes on video elements better.
              src={publicUrl}
              controls
              preload={isCurrentSlide ? 'auto' : 'metadata'}
              className='h-full w-full object-contain'
              poster={file.thumbnailUrl || undefined}
            >
              Your browser does not support the video tag.
            </video>
          )}

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
    // Keep currentSlideIndex in dependencies to ensure renderMainMedia re-runs
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
          key={file.url + index} // Key for thumbnail item itself
          className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-200 ${
            isActive
              ? 'scale-105 border-blue-500'
              : 'border-transparent opacity-70 hover:opacity-100'
          }`}
          onClick={() => handleThumbnailClick(index)}
        >
          {isImage && (
            <Image
              key={publicUrl + '-thumb'} // Unique key for thumbnail Image
              src={publicUrl}
              alt={file.fileName || `Thumbnail ${index + 1}`}
              fill
              sizes='80px'
              style={{ objectFit: 'cover' }}
              className='transition-transform duration-200 group-hover:scale-105'
              loading='lazy' // Thumbnails can always be lazy loaded
            />
          )}
          {isVideo && (
            <>
              {file.thumbnailUrl ? (
                <Image
                  key={file.thumbnailUrl || publicUrl + '-video-thumb'} // Unique key for video thumbnail Image
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
        <CarouselContent className='relative flex h-[calc(70vh-8rem)] min-h-[300px] w-full rounded-md bg-gray-900'>
          {playableMediaFiles.map((file, index) => (
            <CarouselItem
              key={`main-${file.url}-${index}`} // Key for the carousel item itself
              className='flex h-full basis-full items-stretch'
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

      <div className='custom-scrollbar mt-4 flex max-h-[120px] flex-wrap justify-center gap-2 overflow-y-auto'>
        {playableMediaFiles.map((file, index) => renderThumbnail(file, index))}
      </div>
    </div>
  );
};

export default MediaCarouselViewer;
