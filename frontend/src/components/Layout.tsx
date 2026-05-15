import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageLoader } from '@/components/PageLoader';

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <div className="container">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
