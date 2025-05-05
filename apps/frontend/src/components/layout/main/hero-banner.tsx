import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Image from 'next/image';
import HeroImage from '@/assets/img/hero-image.jpg';

export default function HeroBanner() {
  return (
    <div
      className='relative h-100 bg-cover bg-center text-white'
      style={{
        backgroundImage: 'url(/placeholder.svg?height=400&width=1200)'
      }}
    >
      <Image
        src={HeroImage}
        alt='Hero Image'
        fill
        className='absolute inset-0 object-cover'
        priority
        quality={100}
      />

      <div className='relative z-10 flex h-full flex-col justify-center p-8'>
        <h1 className='mb-2 text-4xl font-bold'>Cuidando dos seus espaços</h1>
        <p className='mb-8 max-w-xl text-lg'>
          Simplifique a manutenção das suas instalações com este sistema
          informatizado de gerenciamento de manutenção.
        </p>
        <div className='flex gap-3'>
          <Button className='bg-sisman-green/80 hover:bg-sisman-green cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' /> Nova ocorrência
          </Button>
          <Button
            variant='ghost'
            className='cursor-pointer bg-gray-700 hover:bg-gray-500'
          >
            <FileText className='mr-2 h-4 w-4' /> Guia de ocorrências
          </Button>
        </div>
      </div>
    </div>
  );
}
