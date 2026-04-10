import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import AlertsPage    from './pages/AlertsPage';
import ReorderPage   from './pages/ReorderPage';
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
      } catch (_) {}
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, 20000);
    return () => clearInterval(id);
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar alertCount={alertCount} />
      <main className="flex-1 p-6 overflow-auto min-w-0">
        <Routes>
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/alerts"    element={<AlertsPage />}    />
          <Route path="/reorder"   element={<ReorderPage />}   />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
      <Route path="/*"     element={<AppLayout />} />
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
