// src/components/MediaGallery.tsx
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { IMediaFile } from '@/types/media';

// Define as extensões de arquivo para cada tipo de mídia
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

// Função para determinar o tipo de mídia com base na extensão do arquivo
const getMediaType = (file: IMediaFile): 'image' | 'video' | 'other' => {
  const extension = file.extension?.toLowerCase();
  if (extension && IMAGE_EXTENSIONS.includes(extension)) {
    return 'image';
  }
  if (extension && VIDEO_EXTENSIONS.includes(extension)) {
    return 'video';
  }
  return 'other';
};

interface MediaGalleryProps {
  files: IMediaFile[];
  getPublicFileUrl: (relativePath: string) => string | undefined;
  galleryTitle?: string;
  onThumbnailClick?: (file: IMediaFile, type: 'image' | 'video') => void;
}

const CardMediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  getPublicFileUrl,
  galleryTitle = 'Galeria de Mídia',
  onThumbnailClick
}) => {
  // Renderiza uma miniatura individual com base no tipo de mídia
  const renderThumbnail = (file: IMediaFile, index: number) => {
    const type = getMediaType(file);
    if (type === 'other') return null; // Não renderiza tipos de arquivo não suportados

    const publicUrl = getPublicFileUrl(file.url);
    if (!publicUrl) return null;

    const altText = file.description || file.fileName || `${type} ${index + 1}`;

    return (
      <div
        key={`${file.url}-${index}`}
        className='group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md'
        onClick={() => onThumbnailClick && onThumbnailClick(file, type)}
      >
        {type === 'image' ? (
          <Image
            src={publicUrl}
            alt={altText}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            style={{ objectFit: 'cover' }}
            className='cursor-pointer transition-transform duration-200 group-hover:scale-105'
          />
        ) : (
          // Para vídeos, renderiza a miniatura ou um fallback
          <>
            {file.thumbnailUrl ? (
              <Image
                src={getPublicFileUrl(file.thumbnailUrl) || file.thumbnailUrl}
                alt={altText}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                style={{ objectFit: 'cover' }}
                className='cursor-pointer transition-transform duration-200 group-hover:scale-105'
              />
            ) : (
              <video
                src={publicUrl}
                preload='metadata'
                className='h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105'
              >
                Your browser does not support the video tag.
              </video>
            )}
            <div className='bg-opacity-40 absolute inset-0 flex cursor-pointer items-center justify-center bg-black text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <PlayCircle size={32} />
            </div>
          </>
        )}
      </div>
    );
  };

  // Filtra apenas os arquivos de mídia suportados
  const mediaFiles = files.filter((file) => getMediaType(file) !== 'other');

  if (mediaFiles.length === 0) {
    return (
      <p className='text-muted-foreground'>
        Nenhum arquivo de mídia para exibir.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{galleryTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-4'>
        {mediaFiles.map((file, index) => renderThumbnail(file, index))}
      </CardContent>
    </Card>
  );
};

export default CardMediaGallery;
