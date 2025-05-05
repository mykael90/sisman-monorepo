'use client';

import { useSession } from 'next-auth/react';

export default function ClientPage() {
  const { data: session, status, update } = useSession();
  // const { data: session, status, update } = useSession({ required: true }); #utilize para bloquear sem middleware
  return (
    <main className='flex h-[calc(100vh-7rem)] w-full flex-col p-8'>
      <div>
        <h1>Client Page</h1>
        <p>This is a client-side protected page.</p>
        <h2>Session Status: {status}</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <button onClick={() => update()}>Update Session</button>
      </div>
    </main>
  );
}
