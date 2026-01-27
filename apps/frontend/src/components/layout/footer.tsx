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
                  href='/under-construction'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Localizador de Edifícios
                </Link>
              </li>
              <li>
                <Link
                  href='/under-construction'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Guia de Manutenção
                </Link>
              </li>
              <li>
                <Link
                  href='/under-construction'
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

        <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-400 pt-6 md:flex-row dark:text-gray-300'>
          {/* Bloco da Esquerda: Copyright e Licença */}
          <div className='text-center md:text-left'>
            <p className='text-sm text-gray-300 dark:text-gray-300'>
              © 2025 Sisman CMMS.
            </p>
            <p className='mt-1 text-xs text-gray-400'>
              Software Livre sob licença{' '}
              <Link
                href='https://www.gnu.org/licenses/agpl-3.0.html'
                target='_blank'
                rel='noopener noreferrer'
                className='underline transition-colors hover:text-gray-200'
              >
                GNU AGPLv3
              </Link>
              .{/* Link Obrigatório da AGPL */}
              <span className='mx-1'>•</span>
              <Link
                href='https://github.com/mykael90/sisman-monorepo'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-blue-400 underline transition-colors hover:text-blue-300'
              >
                Acessar Código Fonte
              </Link>
            </p>
          </div>

          {/* Bloco da Direita: Autoria */}
          <div className='text-center md:text-right'>
            <p className='text-sm font-bold text-gray-200 dark:text-gray-300'>
              Desenvolvido por Mykael Mello
            </p>
            <p className='text-xs text-gray-400'>Prof. Eng. Civil</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
