// src/components/MediaGallery.tsx
import React from 'react';
import Image from 'next/image'; // Assumindo que você está usando Next.js e o componente Image
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assumindo componentes Shadcn UI
import { PlayCircle } from 'lucide-react'; // Assumindo que você tem lucide-react para ícones

// Importar a interface MediaFile
import { IMediaFile } from '@/types/media'; // Ajuste o caminho conforme onde você salvou a interface

// 3. Definir as propriedades do componente
interface MediaGalleryProps {
  /**
   * An array of media files to display.
   */
  files: IMediaFile[];
  /**
   * A function that takes a relative file URL (from `MediaFile.url`)
   * and returns its public accessible URL. This makes the component generic
   * and decoupled from specific URL generation logic.
   */
  getPublicFileUrl: (relativePath: string) => string | undefined;
  /**
   * Optional: Title for the photo gallery section.
   * @default "Photo Gallery"
   */
  imageGalleryTitle?: string;
  /**
   * Optional: Title for the video gallery section.
   * @default "Video Gallery"
   */
  videoGalleryTitle?: string;
  /**
   * Optional: Callback function when a thumbnail is clicked.
   * It receives the clicked file and its media type ('image' or 'video').
   * This is where you would trigger your modal logic.
   */
  onThumbnailClick?: (file: IMediaFile, type: 'image' | 'video') => void;
}

const CardMediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  getPublicFileUrl,
  imageGalleryTitle = 'Photo Gallery',
  videoGalleryTitle = 'Video Gallery',
  onThumbnailClick
}) => {
  // Define extensões comuns para imagens e vídeos
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']; // Adicione mais se necessário

  // Filtra os arquivos em listas separadas de imagens e vídeos
  const imageFiles = files.filter(
    (file) =>
      file.extension && imageExtensions.includes(file.extension.toLowerCase())
  );

  const videoFiles = files.filter(
    (file) =>
      file.extension && videoExtensions.includes(file.extension.toLowerCase())
  );

  // Função auxiliar para renderizar uma miniatura individual
  const renderThumbnail = (
    file: IMediaFile,
    index: number,
    type: 'image' | 'video'
  ) => {
    const publicUrl = getPublicFileUrl(file.url);
    if (!publicUrl) return null; // Não renderiza se a URL pública não puder ser determinada

    const altText = file.description || file.fileName || `${type} ${index + 1}`;

    return (
      <div
        key={`${file.url}-${index}`} // Chave mais robusta usando url e index
        className='group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md'
        // Anexa o manipulador de clique para futuras funcionalidades de modal
        onClick={() => onThumbnailClick && onThumbnailClick(file, type)}
      >
        {type === 'image' && (
          <Image
            src={publicUrl}
            alt={altText}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            style={{ objectFit: 'cover' }}
            className='cursor-pointer transition-transform duration-200 group-hover:scale-105'
            // Em caso de erro ao carregar a imagem, você pode adicionar um `onError` aqui
          />
        )}
        {type === 'video' && (
          <>
            {/* Prioriza uma URL de miniatura dedicada se fornecida */}
            {file.thumbnailUrl ? (
              <Image
                src={file.thumbnailUrl}
                alt={altText}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                style={{ objectFit: 'cover' }}
                className='cursor-pointer transition-transform duration-200 group-hover:scale-105'
              />
            ) : (
              // Fallback: Usa o próprio elemento de vídeo para gerar um pôster (primeiro frame)
              <video
                src={publicUrl}
                preload='metadata' // Carrega apenas metadados para obter o primeiro frame sem baixar o vídeo completo
                className='h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105'
                // Considerações futuras: adicionar 'muted' e 'autoPlay' para prévias de vídeo ao passar o mouse
              >
                Your browser does not support the video tag.
              </video>
            )}
            {/* Overlay com ícone de reprodução para vídeos */}
            <div className='bg-opacity-40 absolute inset-0 flex cursor-pointer items-center justify-center bg-black text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <PlayCircle size={32} />
            </div>
          </>
        )}
      </div>
    );
  };

  const hasMedia = imageFiles.length > 0 || videoFiles.length > 0;

  if (!hasMedia) {
    return <p className='text-muted-foreground'>No media files to display.</p>;
  }

  return (
    <>
      {/* Seção da Galeria de Fotos */}
      {imageFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{imageGalleryTitle}</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-4'>
            {imageFiles.map((file, index) =>
              renderThumbnail(file, index, 'image')
            )}
          </CardContent>
        </Card>
      )}

      {/* Seção da Galeria de Vídeos */}
      {videoFiles.length > 0 && (
        <Card className={imageFiles.length > 0 ? 'mt-6' : ''}>
          {' '}
          {/* Adiciona margem superior se também houver fotos */}
          <CardHeader>
            <CardTitle className='text-lg'>{videoGalleryTitle}</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-4'>
            {videoFiles.map((file, index) =>
              renderThumbnail(file, index, 'video')
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CardMediaGallery;
