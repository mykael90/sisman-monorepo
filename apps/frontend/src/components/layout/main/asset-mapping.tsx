import { Building } from 'lucide-react';

export default function AssetMapping() {
  return (
    <div>
      <h2 className='mb-6 text-xl font-bold text-gray-800'>
        Mapeamento de Ativos e Equipes
      </h2>

      <div className='flex gap-6'>
        <div className='relative flex-1 overflow-hidden rounded-lg border bg-white'>
          <img
            src='/placeholder.svg?height=300&width=800'
            alt='Mapa'
            className='h-40 w-full object-cover'
          />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white px-2 py-1 text-sm shadow'>
            Escritório Central
          </div>
        </div>

        <div className='w-64 space-y-3'>
          <LocationButton label='Escritório Central' active />
          <LocationButton label='Filial 1' />
          <LocationButton label='Filial 2' />
        </div>
      </div>
    </div>
  );
}

function LocationButton({
  label,
  active = false
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-lg border p-3 ${
        active ? 'bg-white' : 'bg-white/50 hover:bg-white'
      }`}
    >
      <Building className='h-4 w-4 text-gray-600' />
      <span className='text-sm font-medium'>{label}</span>
    </button>
  );
}
