import { MetricsTabs } from './_components/metrics-tabs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetricsTabs />
      {children}
    </>
  );
}
