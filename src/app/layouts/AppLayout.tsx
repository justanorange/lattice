/**
 * Application Layout
 * Common layout wrapper with header and outlet for routes
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container } from '@/shared/ui';
import { ThemeMode } from '@/widgets/theme-mode/ui/ThemeMode';

/**
 * Scroll to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const AppLayout = () => {
  return (
    <div className="relative min-h-screen">
      <ScrollToTop />
      {/* Header */}
      <header
        className="
          fixed inset-x-0 top-0 z-10
          flex items-center justify-end
          p-4
          bg-white/70 dark:bg-gray-950/70
          backdrop-blur-md
        "
      >
        <ThemeMode />
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  );
};
