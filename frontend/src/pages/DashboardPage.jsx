import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, medicinesAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { expiryLabel, getDaysToExpiry } from '../utils/status';
import {
  Package, AlertTriangle, TrendingDown, XCircle,
  RefreshCw, ArrowRight, Bell
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={17} className={iconColor} />
      </div>
    </div>
    <div className={`text-3xl font-semibold ${valueColor || 'text-slate-800'}`}>{value}</div>
    <div className="text-xs text-slate-400">{sub}</div>
  </div>
);

export default function DashboardPage() {
  const [summary,  setSummary]  = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [sumRes, medRes] = await Promise.all([
        dashboardAPI.summary(),
        medicinesAPI.getAll({ limit: 7, sort: '-createdAt' }),
      ]);
      setSummary(sumRes.data.data);
      setRecent(medRes.data.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      <RefreshCw size={16} className="animate-spin mr-2" /> Loading dashboard…
    </div>
  );

  const { stats, alerts } = summary || { stats: {}, alerts: [] };

  return (
    <div className="fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Inventory overview</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition px-3 py-1.5 rounded-lg hover:bg-blue-50">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines" value={stats.total || 0}
          icon={Package} iconBg="bg-blue-50" iconColor="text-blue-500"
          sub="In inventory" />
        <StatCard label="Low Stock" value={stats.low || 0}
          icon={TrendingDown} iconBg="bg-yellow-50" iconColor="text-yellow-500"
          valueColor="text-yellow-600" sub="Need restocking" />
        <StatCard label="Critical" value={stats.critical || 0}
          icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500"
          valueColor="text-red-600" sub="Urgent action needed" />
        <StatCard label="Expired" value={stats.expired || 0}
          icon={XCircle} iconBg="bg-slate-100" iconColor="text-slate-400"
          valueColor="text-slate-500" sub="Remove immediately" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent inventory */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Recent Inventory</h2>
            <button onClick={() => navigate('/inventory')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">No medicines added yet.</div>
            )}
            {recent.map((m) => {
              const days = getDaysToExpiry(m.expiryDate);
              const expColor = days < 0 ? 'text-red-500' : days <= 7 ? 'text-yellow-600' : 'text-slate-400';
              return (
                <div key={m._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{m.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{m.category}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 w-10 text-right">{m.quantity}</div>
                  <div className={`text-xs ${expColor} w-28 text-right`}>{expiryLabel(m.expiryDate)}</div>
                  <StatusBadge status={m.status || 'instock'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700">Active Alerts</h2>
            </div>
            {alerts.length > 0 && (
              <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">All clear!</div>
            )}
            {alerts.slice(0, 8).map((a, i) => (
              <div key={i}
                className={`flex gap-2.5 p-3 rounded-xl text-xs ${
                  a.type === 'danger'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                }`}>
                <span className="mt-0.5 shrink-0">{a.type === 'danger' ? '🚨' : '⚠️'}</span>
                <span>{a.message}</span>
              </div>
            ))}
          </div>
          {alerts.length > 0 && (
            <div className="px-3 pb-3">
              <button onClick={() => navigate('/reorder')}
                className="w-full py-2 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition">
                View Reorder List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
