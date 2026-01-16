'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { FileText, File } from 'lucide-react'; // Importando File para outros arquivos
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MediaGallery from '@/components/media/card-media-gallery';
import MediaCarouselViewer from '@/components/media/media-carousel-viewer';
import { IMediaFile } from '@/types/media';
import { getPublicFotoSigaa } from '../../../../../../lib/fetch/get-public-foto-sigaa';

interface ManutencaoRequisicaoAnexosProps {
  data: ISipacRequisicaoManutencaoShow;
}

const IMAGE_VIDEO_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'avif',
  'mp4',
  'webm',
  'ogg',
  'mov',
  'avi',
  'mkv'
];

export function ManutencaoRequisicaoAnexos({
  data
}: ManutencaoRequisicaoAnexosProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);
  const [viewerFiles, setViewerFiles] = useState<IMediaFile[]>([]);

  if (!data.arquivos || data.arquivos.length === 0) {
    return null;
  }

  const mediaFiles: IMediaFile[] = (data.arquivos || []).map((file) => ({
    url: file.urlRelativo,
    extension: file.extensao as string,
    fileName: file.nomeArquivo || 'Arquivo sem nome',
    description: file.descricao || 'Sem descrição'
  }));

  const imageVideoFiles = mediaFiles.filter((file) =>
    IMAGE_VIDEO_EXTENSIONS.includes(file.extension.toLowerCase())
  );

  const otherFiles = mediaFiles.filter(
    (file) => !IMAGE_VIDEO_EXTENSIONS.includes(file.extension.toLowerCase())
  );

  const handleMediaClick = (file: IMediaFile) => {
    if (IMAGE_VIDEO_EXTENSIONS.includes(file.extension.toLowerCase())) {
      const playableFiles = imageVideoFiles;
      const clickedIndex = playableFiles.findIndex(
        (f) => f.url === file.url && f.extension === file.extension
      );

      if (clickedIndex !== -1) {
        setViewerFiles(playableFiles);
        setInitialViewerIndex(clickedIndex);
        setIsViewerOpen(true);
      }
    } else {
      // Para outros tipos de arquivo, abre em uma nova aba
      window.open(getPublicFotoSigaa(file.url), '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Anexos</CardTitle>
      </CardHeader>
      <CardContent>
        {imageVideoFiles.length > 0 && (
          <div className='mb-4'>
            <h3 className='text-md mb-2 font-semibold'>Imagens e Vídeos</h3>
            <MediaGallery
              files={imageVideoFiles}
              getPublicFileUrl={getPublicFotoSigaa}
              galleryTitle=''
              onThumbnailClick={handleMediaClick}
            />
          </div>
        )}

        {otherFiles.length > 0 && (
          <div>
            <h3 className='text-md mb-2 font-semibold'>Outros Documentos</h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {otherFiles.map((otherFile) => (
                <div
                  key={otherFile.fileName}
                  className='flex items-center space-x-2'
                >
                  <FileText className='text-muted-foreground h-5 w-5' />
                  <a
                    href={getPublicFotoSigaa(otherFile.url)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:underline'
                  >
                    {otherFile.fileName}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediaFiles.length === 0 && (
          <p className='text-muted-foreground'>Nenhum anexo disponível.</p>
        )}
      </CardContent>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className='max-w-screen-lg border-none bg-transparent p-0'>
          <MediaCarouselViewer
            files={viewerFiles}
            getPublicFileUrl={getPublicFotoSigaa}
            initialIndex={initialViewerIndex}
            onClose={() => setIsViewerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
