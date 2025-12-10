/**
 * Application Layout
 * Common layout wrapper with header and outlet for routes
 */

import { Outlet } from 'react-router-dom';
import { Container } from '@/shared/ui';
import { ThemeMode } from '@/widgets/theme-mode/ui/ThemeMode';

export const AppLayout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header
        className="
          fixed inset-x-0 top-0 z-10
          flex items-center justify-end
          p-4
          bg-white/70 dark:bg-gray-900/70
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
