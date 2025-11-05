'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

export default function CopiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hasPermission, permissions } = usePermissions();

  useEffect(() => {
    if (permissions !== null && !hasPermission('security', 'backup.view')) {
      router.push('/dashboard');
    }
  }, [permissions, hasPermission, router]);

  if (permissions === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission('security', 'backup.view')) {
    return null;
  }

  return <>{children}</>;
}
