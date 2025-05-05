import isMobile from '@/src/lib/is-mobile';

export default async function Mobile() {
  return (
    <div>
      <h1>
        {(await isMobile())
          ? 'Você está acessando de um dispositivo móvel!'
          : 'Você está acessando de um desktop ou tablet!'}
      </h1>
    </div>
  );
}
