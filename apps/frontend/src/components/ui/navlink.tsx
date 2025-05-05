'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  className,
  onClick
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`hover:bg-sisman-green hover:text-sisman-gray dark:hover:bg-sisman-green block rounded-md px-4 py-2 ${
        isActive ? 'bg-sisman-green/20 font-semibold' : ''
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
