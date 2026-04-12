import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import AlertsPage from './pages/AlertsPage';
import ReorderPage from './pages/ReorderPage';
import { dashboardAPI } from './services/api';

// Protected layout wrapper
function AppLayout() {
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  // Poll alert count for sidebar badge
  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      try {
        const { data } = await dashboardAPI.summary();
        setAlertCount(data.data.alerts.length);
      } catch (_) { }
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, 20000);
    return () => clearInterval(id);
  }, [user]);

  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar alertCount={alertCount} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm shrink-0">
          <div>
            <div className="text-base font-semibold text-slate-800">PharmaFlow</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-100/80 border border-slate-200 rounded-md px-3 py-1.5 font-medium">
            v1.0 · Clinic Edition
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes location={location} key={location.pathname}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reorder" element={<ReorderPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Root app — handles auth routing
function RootRouter() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
      Loading…
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
