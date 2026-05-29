import AdminRealtimeToast from '@/components/AdminRealtimeToast';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Toast global pour tout le tableau de bord administrateur */}
      <AdminRealtimeToast />
    </>
  );
}
