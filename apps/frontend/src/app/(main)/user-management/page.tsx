import { UserManagementPage } from '@/components/user-management/user-management-page';
import { Suspense } from 'react';
import { Data } from './data';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading initial data...</p>}>
      <Data>
        <UserManagementPage />
      </Data>
    </Suspense>
  );
}
