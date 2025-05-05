import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Sisman',
  description: 'Login page for Sisman'
};

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
