/*
 * Copyright (C) 2026 [Mykael dos Anjos e Mello]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
