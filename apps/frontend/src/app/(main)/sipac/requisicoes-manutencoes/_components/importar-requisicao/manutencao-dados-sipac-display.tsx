import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoWithRelations } from '../../requisicoes-manutencoes-types';
import { getPublicFotoSigaa } from '../../../../../../lib/fetch/get-public-foto-sigaa';
import MediaGallery from '@/components/media/card-media-gallery';
import MediaCarouselViewer from '@/components/media/media-carousel-viewer';
import { IMediaFile } from '@/types/media';
import { Dialog, DialogContent } from '@/components/ui/dialog'; // Shadcn UI Dialog para o modal
import { useState } from 'react';

interface ManutencaoDadosSipacDisplayProps {
  data: ISipacRequisicaoManutencaoWithRelations | null;
}

export function ManutencaoDadosSipacDisplay({
  data
}: ManutencaoDadosSipacDisplayProps) {
  if (!data) {
    return null;
  }

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);
  const [viewerFiles, setViewerFiles] = useState<IMediaFile[]>([]);

  // Cast data to any to bypass TypeScript errors due to incomplete type definitions for nested objects
  const displayData: any = data;

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return '-';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return String(dateInput);
    }
  };

  // Mapeia os dados originais para a interface MediaFile
  const mediaFiles: IMediaFile[] = (data.arquivos || []).map((file) => ({
    url: file.urlRelativo,
    extension: file.extensao as string,
    fileName: file.nomeArquivo,
    description: file.descricao
  }));

  console.log(mediaFiles);

  // Handler que é chamado quando uma miniatura na MediaGallery é clicada
  const handleThumbnailClick = (file: IMediaFile, type: 'image' | 'video') => {
    // Para o viewer, queremos exibir todos os arquivos de mídia (imagens e vídeos)
    // na ordem original, mas iniciar no arquivo clicado.
    const playableFiles = mediaFiles.filter((f) =>
      [
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
      ].includes(f.extension.toLowerCase())
    );

    const clickedIndex = playableFiles.findIndex(
      (f) => f.url === file.url && f.extension === file.extension
    );

    if (clickedIndex !== -1) {
      setViewerFiles(playableFiles); // Define os arquivos que o viewer vai exibir
      setInitialViewerIndex(clickedIndex); // Define qual arquivo deve ser o primeiro
      setIsViewerOpen(true); // Abre o modal
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            Informações da Requisição de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            <strong>ID:</strong> {displayData.id}
          </p>
          <p>
            <strong>Número da Requisição:</strong>{' '}
            {displayData.numeroRequisicao}
          </p>
          <p>
            <strong>Tipo da Requisição:</strong> {displayData.tipoDaRequisicao}
          </p>
          <p>
            <strong>Divisão:</strong> {displayData.divisao}
          </p>
          <p>
            <strong>Status:</strong> {displayData.status}
          </p>
          <p>
            <strong>Data de Cadastro:</strong>{' '}
            {formatDate(displayData.dataDeCadastro)}
          </p>
          <p>
            <strong>Nome da Unidade Requisitante:</strong>{' '}
            {displayData.nomeUnidadeRequisitante}
          </p>
          <p>
            <strong>Nome da Unidade de Custo:</strong>{' '}
            {displayData.nomeUnidadeDeCusto}
          </p>
          <p>
            <strong>Nome do Prédio:</strong> {displayData.nomePredio}
          </p>
          <p>
            <strong>Descrição:</strong> {displayData.descricao}
          </p>
          <p>
            <strong>Local:</strong> {displayData.local}
          </p>
          <p>
            <strong>Representante da Unidade de Origem:</strong>{' '}
            {displayData.representanteDaUnidadeDeOrigem}
          </p>
          <p>
            <strong>Telefones do Representante:</strong>{' '}
            {displayData.telefonesDoRepresentante}
          </p>
          <p>
            <strong>Ramal:</strong> {displayData.ramal}
          </p>
          <p>
            <strong>Email:</strong> {displayData.email}
          </p>
          <p>
            <strong>Horário para Atendimento:</strong>{' '}
            {displayData.horarioParaAtendimento}
          </p>
          <p>
            <strong>Observação:</strong> {displayData.observacao}
          </p>
          <p>
            <strong>Usuário de Gravação:</strong> {displayData.usuarioGravacao}
          </p>
        </CardContent>
      </Card>

      <div className='flex flex-wrap gap-6'>
        {displayData.informacoesServico &&
          displayData.informacoesServico.length > 0 && (
            <Card className='min-w-[300px] flex-1'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Informações de Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {displayData.informacoesServico.map(
                  (info: any, index: number) => (
                    <div key={index} className='border-b pb-2 last:border-b-0'>
                      <p>
                        <strong>Diagnóstico:</strong> {info.diagnostico}
                      </p>
                      <p>
                        <strong>Executante:</strong> {info.executante}
                      </p>
                      <p>
                        <strong>Data de Cadastro:</strong>{' '}
                        {formatDate(info.dataDeCadastro)}
                      </p>
                      <p>
                        <strong>Técnico Responsável:</strong>{' '}
                        {info.tecnicoResponsavel}
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

        {displayData.predios && displayData.predios.length > 0 && (
          <Card className='min-w-[300px] flex-1'>
            <CardHeader>
              <CardTitle className='text-lg'>Prédios</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {displayData.predios.map((predio: any, index: number) => (
                <div key={index} className='border-b pb-2 last:border-b-0'>
                  <p>
                    <strong>Tipo:</strong> {predio.tipo}
                  </p>
                  <p>
                    <strong>Município:</strong> {predio.municipio}
                  </p>
                  <p>
                    <strong>Campus:</strong> {predio.campus}
                  </p>
                  <p>
                    <strong>RIP:</strong> {predio.rip}
                  </p>
                  <p>
                    <strong>Imóvel Terreno:</strong> {predio.imovelTerreno}
                  </p>
                  <p>
                    <strong>Prédio:</strong> {predio.predio}
                  </p>
                  <p>
                    <strong>Zona:</strong> {predio.zona}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* {displayData.arquivos &&
        displayData.arquivos.filter(
          (file: any) =>
            file.extensao &&
            ['jpg', 'jpeg', 'png', 'gif'].includes(file.extensao.toLowerCase())
        ).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Galeria de Fotos</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-4'>
              {displayData.arquivos
                .filter(
                  (file: any) =>
                    file.extensao &&
                    ['jpg', 'jpeg', 'png', 'gif'].includes(
                      file.extensao.toLowerCase()
                    )
                )
                .map((file: any, index: number) => {
                  //utilizando api_scraping
                  // const parametrosFoto = extrairParametros(file.urlRelativo);
                  // const urlFoto = `/api/sipac/foto?idProducao=${parametrosFoto.idArquivo}&key=${parametrosFoto.key}`;

                  //utilizando url publica disponivel pela ufrn para arquivos
                  const urlFoto = getPublicFotoSigaa(file.urlRelativo);

                  console.log(urlFoto);

                  if (!urlFoto) return null;

                  return (
                    <div
                      key={index}
                      className='relative h-24 w-24 overflow-hidden rounded-md'
                    >
                      <Image
                        src={urlFoto}
                        alt={`Foto ${index + 1}`}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        style={{
                          objectFit: 'cover'
                        }}
                        className='cursor-pointer'
                      />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )} */}

      <MediaGallery
        files={mediaFiles}
        getPublicFileUrl={getPublicFotoSigaa}
        galleryTitle='Mídias Relacionadas'
        onThumbnailClick={handleThumbnailClick} // Passe o handler de clique para o modal
      />

      {/* Componente Modal Shadcn UI para o MediaCarouselViewer */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className='max-w-screen-lg border-none bg-transparent p-0'>
          <MediaCarouselViewer
            files={viewerFiles} // Passa os arquivos filtrados e ordenados para o viewer
            getPublicFileUrl={getPublicFotoSigaa}
            initialIndex={initialViewerIndex}
            onClose={() => setIsViewerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {displayData.requisicoesMateriais &&
        displayData.requisicoesMateriais.length > 0 && (
          // Card Principal que agrupa todas as Requisições de Materiais
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                Requisições de Materiais Associadas {/* Título da seção */}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Aqui começa o loop para cada requisição individual */}
              {displayData.requisicoesMateriais.map(
                (req: any, index: number) => (
                  <Card key={index} className='overflow-hidden'>
                    <CardHeader className='bg-gray-50'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                          <CardTitle className='text-lg'>
                            Requisição: {req.numeroDaRequisicao}
                          </CardTitle>
                          <p className='text-sm text-gray-500'>
                            ID: {req.id} &bull; Data:{' '}
                            {formatDate(req.dataDeCadastro)}
                          </p>
                        </div>
                        <div className='text-sm font-medium'>
                          Status: {req.statusAtual}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-4'>
                      {/* Tabela de Itens */}
                      {req.itens && req.itens.length > 0 && (
                        <div className='overflow-x-auto rounded-lg border'>
                          <table className='w-full text-sm'>
                            <thead className='bg-gray-100'>
                              <tr>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Material
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Quantidade
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Valor
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Total
                                </th>
                                {/* <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Código
                                </th> */}
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-white'>
                              {req.itens.map((item: any, itemIndex: number) => (
                                <tr
                                  key={itemIndex}
                                  className='hover:bg-gray-50'
                                >
                                  <td className='px-4 py-2 text-gray-900'>
                                    {item.material}
                                  </td>
                                  <td className='px-4 py-2 text-gray-900'>
                                    {item.quantidade}
                                  </td>
                                  <td className='px-4 py-2 text-gray-900'>
                                    {item.valor}
                                  </td>
                                  <td className='px-4 py-2 text-gray-900'>
                                    {item.total}
                                  </td>
                                  {/* <td className='px-4 py-2 text-gray-900'>
                                    {item.codigo}
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {/* Rodapé com os totais */}
                      <div className='mt-4 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-4'>
                        <div className='text-center'>
                          <p className='text-xs font-medium text-gray-500'>
                            Grupo de Material
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.grupoDeMaterial}
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-xs font-medium text-gray-500'>
                            Total Quantidade
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.totalGrupoQuantidade}
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-xs font-medium text-gray-500'>
                            Total Valor Calculado
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.totalGrupoValorCalculado}
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.totalGrupoValorTotal}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </CardContent>
          </Card>
        )}

      {displayData.requisicaoManutencaoMae && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Requisição Mãe</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p>
              <strong>Número/Ano:</strong>{' '}
              {displayData.requisicaoManutencaoMae.numeroAno}
            </p>
            <p>
              <strong>Descrição:</strong>{' '}
              {displayData.requisicaoManutencaoMae.descricao}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {displayData.requisicaoManutencaoMae.status}
            </p>
            <p>
              <strong>Data de Cadastro:</strong>{' '}
              {formatDate(displayData.requisicaoManutencaoMae.dataDeCadastro)}
            </p>
            <p>
              <strong>Usuário:</strong>{' '}
              {displayData.requisicaoManutencaoMae.usuario}
            </p>
            <p>
              <strong>ID:</strong> {displayData.requisicaoManutencaoMae.id}
            </p>
          </CardContent>
        </Card>
      )}

      {displayData.requisicoesManutencaoFilhas &&
        displayData.requisicoesManutencaoFilhas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Requisições Filhas</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {displayData.requisicoesManutencaoFilhas.map(
                (req: any, index: number) => (
                  <div key={index} className='border-b pb-2 last:border-b-0'>
                    <p>
                      <strong>Número/Ano:</strong> {req.numeroAno}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {req.descricao}
                    </p>
                    <p>
                      <strong>Status:</strong> {req.status}
                    </p>
                    <p>
                      <strong>Data de Cadastro:</strong>{' '}
                      {formatDate(req.dataDeCadastro)}
                    </p>
                    <p>
                      <strong>Usuário:</strong> {req.usuario}
                    </p>
                    <p>
                      <strong>ID:</strong> {req.id}
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
