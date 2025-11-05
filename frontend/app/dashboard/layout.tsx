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

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
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
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
          <main className={`${mainPaddingLeft} pt-20 transition-[padding] duration-200`}>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </OnboardingProvider>
    </ProtectedRoute>
  );
}
