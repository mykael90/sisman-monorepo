import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/_options';

export default async function ServerPage({ params }) {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   const callbackUrl = encodeURIComponent('/protected/server');
  //   redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
  // } # utilize para bloquear sem middleware

  return (
    <main className='flex h-[calc(100vh-7rem)] w-full flex-col p-8'>
      <div>
        <h1>Server Page</h1>
        <p>This is a server-side protected page.</p>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </main>
  );
}
