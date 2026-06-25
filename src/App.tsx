import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { healthAPI } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Opportunities } from './pages/Opportunities';
import { OpportunityDetails } from './pages/OpportunityDetails';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PostWithUs } from './pages/PostWithUs';
import { ManageDashboard } from './pages/employer/ManageDashboard';
import { ManageApplicants } from './pages/employer/ManageApplicants';
import { Inbox } from './pages/Inbox';
import { Subscribe } from './pages/Subscribe';
import { Tracker } from './pages/Tracker';
import { Portfolio } from './pages/Portfolio';
import { MobileNav } from './components/MobileNav';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDisputes } from './pages/AdminDisputes';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/PageLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { AlertProvider } from './contexts/AlertContext';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Pre-warm the Render backend as soon as the app loads.
  // Render free tier spins down after 15 min — this starts the wake-up process
  // while the user is still reading the homepage, so /opportunities loads instantly.
  useEffect(() => {
    healthAPI.check().catch(() => { /* silent — server may be waking up */ });
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/opportunity/')) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Scroll to hash after navigation (e.g. /#newsletter)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const scrollToEl = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Small delay to let the page render before scrolling
      const timer = setTimeout(scrollToEl, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {loading && <PageLoader />}
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunity/:slug" element={<OpportunityDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/post-with-us" element={<PostWithUs />} />
          <Route path="/manage" element={<ManageDashboard />} />
          <Route path="/manage/applicants/:id" element={<ManageApplicants />} />
          {/* /manage/edit/:id reuses PostWithUs which already handles location.state.editPost */}
          <Route path="/manage/edit/:id" element={<PostWithUs />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/applied" element={<Tracker />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/subscribe" element={<Subscribe />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileNav />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AlertProvider>
    </ErrorBoundary>
  );
}

// Refurbished
