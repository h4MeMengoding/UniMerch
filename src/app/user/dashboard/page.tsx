import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}