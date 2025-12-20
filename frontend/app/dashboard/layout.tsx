'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { OnboardingProvider } from '@/components/shared/OnboardingProvider';

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === 'true');
    }
  }, []);

  const handleToggleCollapse = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newCollapsedState));
  };

  const mainPaddingLeft = sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-64';

  return (
    <ProtectedRoute>
      <OnboardingProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
          >
            Saltar al contenido principal
          </a>
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
          <main 
            id="main-content"
            className={`${mainPaddingLeft} pt-20 transition-[padding] duration-200`}
            role="main"
          >
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </OnboardingProvider>
    </ProtectedRoute>
  );
}
