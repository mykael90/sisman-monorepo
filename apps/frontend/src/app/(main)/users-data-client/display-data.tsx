'use client';

import { useState, useEffect } from 'react'
import { getUsers } from './_actions';
 
export function DisplayData() {
  const [users, setUsers] = useState(null)
 
  useEffect(() => {
    async function fetchPosts() {
      const data = await getUsers()
      setUsers(data)
    }
    fetchPosts()
  }, [])
 
  if (!users) return <div>Loading...</div>

  return (
    <div>
      <p>Current Message: {JSON.stringify(users)}</p>
      {/* <button onClick={handleRefresh} disabled={isPending}>
        {isPending ? 'Refreshing...' : 'Refresh Data (via Server Action)'}
      </button> */}
    </div>
  );
}