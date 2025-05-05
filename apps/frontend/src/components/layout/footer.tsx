import { Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-sisman-blue py-8 text-white dark:bg-gray-800'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Building Locator
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  Maintenance Guide
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='text-gray-300 transition-colors hover:text-white'
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Contact</h3>
            <ul className='space-y-2'>
              <li className='flex items-center gap-2 text-gray-300'>
                <span>✉️</span>
                <a
                  href='mailto:support@sisman.com'
                  className='transition-colors hover:text-white'
                >
                  support@sisman.com
                </a>
              </li>
              <li className='flex items-center gap-2 text-gray-300'>
                <span>📞</span>
                <a
                  href='tel:+15551234567'
                  className='transition-colors hover:text-white'
                >
                  +1 (555) 123-4567
                </a>
              </li>
            </ul>
          </div>

          <div className='dark:text-gray-300'>
            <h3 className='mb-4 text-lg font-medium'>Follow Us</h3>
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

        <div className='mt-8 flex flex-col items-center justify-between border-t border-gray-600 pt-6 md:flex-row dark:text-gray-300'>
          <p className='text-sm text-gray-400 dark:text-gray-300'>
            © 2025 Sisman CMMS. All rights reserved.
          </p>
          <p className='mt-2 text-sm text-gray-400 md:mt-0 dark:text-gray-300'>
            Developed by Sisman Team
          </p>
        </div>
      </div>
    </footer>
  );
}
