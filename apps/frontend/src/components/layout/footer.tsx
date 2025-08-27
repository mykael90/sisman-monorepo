import { Facebook, Linkedin, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-neutral-600 py-8 text-white dark:bg-gray-800'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Links Rápidos</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Localizador de Edifícios
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Guia de Manutenção
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Contato</h3>
            <ul className='space-y-2'>
              <li className='flex items-center gap-2 text-gray-300'>
                <span>✉️</span>
                <a
                  href='mailto:mykael.mello@ufrn.br'
                  className='transition-colors hover:text-white'
                >
                  mykael.mello@ufrn.br
                </a>
              </li>
              <li className='flex items-center gap-2 text-gray-300'>
                <span>
                  <Phone strokeWidth='2' className='h-5 w-5' />
                </span>
                <a
                  href='tel:+5584999999999'
                  className='transition-colors hover:text-white'
                >
                  +55 (84) 99999-9999
                </a>
              </li>
            </ul>
          </div>

          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Siga-nos</h3>
            <div className='flex gap-4'>
              <a
                href='#'
                className='text-gray-300 transition-colors hover:text-white'
              >
                <Linkedin className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-gray-300 transition-colors hover:text-white'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-gray-300 transition-colors hover:text-white'
              >
                <Facebook className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>

        <div className='mt-8 flex flex-col items-center justify-between border-t border-gray-400 pt-6 md:flex-row dark:text-gray-300'>
          <p className='text-sm text-gray-300 dark:text-gray-300'>
            © 2025 Sisman CMMS. Todos os direitos reservados.
          </p>
          <p className='mt-2 text-sm font-bold text-gray-200 md:mt-0 dark:text-gray-300'>
            Desenvolvido por Mykael Mello, Prof. Eng. Civil
          </p>
        </div>
      </div>
    </footer>
  );
}
