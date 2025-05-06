'use client';

import { useState, useEffect, use } from 'react'
import { getUsers } from './_actions';
 
export function DisplayData({ dataPromise }) {
  const [users, setUsers] = useState(null)
  // const users1 = use(dataPromise);
  // console.log(users1);

  useEffect(() => {
    async function fetchPosts() {
      const data = use(dataPromise())
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