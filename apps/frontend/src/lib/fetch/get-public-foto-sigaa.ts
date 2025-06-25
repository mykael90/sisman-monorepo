//a foto retornada pelo endpoint info e outros endpoints é uma rota protegida, mas tem uma rota publica, essa função é para transformar na rota publica

export function getPublicFotoSigaa(protectedUrl: string) {
  const publicUrlBaseFiles = 'https://sigaa.ufrn.br/shared/verArquivo';

  try {
    // Assumindo que session.user.image é uma URL completa
    const url = new URL(protectedUrl);
    const idProducao = url.searchParams.get('idProducao');
    const key = url.searchParams.get('key');

    if (idProducao && key) {
      const publicFotoSigaa = `${publicUrlBaseFiles}?idArquivo=${idProducao}&key=${key}`;
      return publicFotoSigaa as string;
    }

    return undefined;
  } catch (error) {
    console.error('URL da imagem do usuário é inválida:', error);
  }
}
