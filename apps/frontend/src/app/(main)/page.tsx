import HeroBanner from '../../components/layout/main/hero-banner';
import MaintenanceStats from '../../components/layout/main/maintenance-stats';
import AssetMapping from '../../components/layout/main/asset-mapping';
import RecentRequests from '../../components/layout/main/recent-requests';

export default function MainContent() {
  return (
    <main>
      <HeroBanner />
      <div className='p-6'>
        <MaintenanceStats />
      </div>
      <div className='bg-gray-100 p-6 dark:bg-gray-800'>
        <AssetMapping />
      </div>
      <div className='p-6'>
        <RecentRequests />
      </div>
    </main>
  );
}
