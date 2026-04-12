import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, medicinesAPI } from '../services/api';
import { CATEGORIES } from '../utils/status';
import {
  Package, AlertTriangle, TrendingDown, XCircle,
  RefreshCw, Bell, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import Skeleton from '../components/Skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor, color='slate', delay=0 }) => {
  const accentClass = {
    blue:  'border-t-blue-500',
    amber: 'border-t-amber-500',
    red:   'border-t-red-500',
    slate: 'border-t-slate-400',
  }[color] || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`bg-white rounded-xl border border-slate-200 border-t-4 p-5 ${accentClass} flex flex-col gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <div className={`text-4xl font-bold tracking-tight ${valueColor || 'text-slate-800'}`}>
        {value}
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [sumRes, medRes] = await Promise.all([
        dashboardAPI.summary(),
        medicinesAPI.getAll({ limit: 1000 }), // Get all for accurate category dist
      ]);
      setSummary(sumRes.data.data);
      setMedicines(medRes.data.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const { stats, alerts } = summary || { stats: {}, alerts: [] };

  // Prepare chart data
  const categoryData = useMemo(() => {
    const counts = {};
    medicines.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(counts).sort(([,a],[,b]) => b - a)); // Sort by values
  }, [medicines]);

  const pieData = Object.keys(categoryData).map((k, i) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: categoryData[k],
    color: COLORS[i % COLORS.length]
  }));

  const barData = [
    { name: 'Healthy',    count: Math.max(0, (stats.total || 0) - (stats.low || 0) - (stats.critical || 0) - (stats.expired || 0)), fill: '#10b981' },
    { name: 'Low Stock',  count: stats.low || 0, fill: '#f59e0b' },
    { name: 'Critical',   count: stats.critical || 0, fill: '#ef4444' },
    { name: 'Expired',    count: stats.expired || 0, fill: '#94a3b8' },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-24 h-9" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Skeleton className="h-[350px] rounded-2xl" />
        <Skeleton className="h-[350px] rounded-2xl" />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6 pb-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time inventory metrics</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-all font-medium">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard delay={0.0} label="Total Assets" value={stats.total || 0}
          icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600" color="blue" />
        <StatCard delay={0.1} label="Low Stock" value={stats.low || 0}
          icon={TrendingDown} iconBg="bg-amber-50" iconColor="text-amber-600" color="amber"
          valueColor="text-amber-600" />
        <StatCard delay={0.2} label="Critical" value={stats.critical || 0}
          icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" color="red"
          valueColor="text-red-600" />
        <StatCard delay={0.3} label="Expired" value={stats.expired || 0}
          icon={XCircle} iconBg="bg-slate-100" iconColor="text-slate-500" color="slate"
          valueColor="text-slate-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Category Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[360px]">
            <h2 className="text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2 mb-6">
              <PieChartIcon size={16} className="text-blue-500" /> Category Distribution
            </h2>
            {pieData.length > 0 ? (
              <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <PieChartIcon size={40} strokeWidth={1} className="mb-3 text-slate-200" />
                <span className="text-sm font-medium">No Category Data</span>
                <span className="text-xs mt-1">Add medicines to see distribution</span>
              </div>
            )}
          </div>

          {/* Stock Level Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[360px]">
             <h2 className="text-sm font-semibold text-slate-700 tracking-wide flex items-center gap-2 mb-6">
              <BarChart3 size={16} className="text-blue-500" /> Stock Health Levels
            </h2>
            {stats.total > 0 ? (
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={75} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={40} strokeWidth={1} className="mb-3 text-slate-200" />
                <span className="text-sm font-medium">No Stock Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[360px]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-700 tracking-wide">System Alerts</h2>
            </div>
            {alerts.length > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5 shadow-sm shadow-red-500/20">
                {alerts.length} NEW
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <Package size={20} className="text-green-500" />
                </div>
                <div className="text-sm font-medium text-slate-600 mb-1">All clear!</div>
                <div className="text-xs">Your inventory is well-stocked and healthy.</div>
              </div>
            ) : (
              alerts.slice(0, 5).map((a, i) => (
                <div key={i}
                  className={`flex gap-3 p-4 rounded-xl text-sm transition-colors cursor-default ${
                    a.type === 'danger'
                      ? 'bg-red-50/50 border border-red-100 text-red-800 hover:bg-red-50'
                      : 'bg-amber-50/50 border border-amber-100 text-amber-800 hover:bg-amber-50'
                  }`}>
                  <span className="shrink-0 mt-0.5">{a.type === 'danger' ? '🚨' : '⚠️'}</span>
                  <span className="font-medium leading-relaxed">{a.message}</span>
                </div>
              ))
            )}
            
            {alerts.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">{alerts.length - 5} more alerts...</span>
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-100">
              <button onClick={() => navigate('/reorder')}
                className="w-full py-2.5 text-sm font-semibold bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm text-slate-700 rounded-lg transition-all focus:ring-2 focus:ring-slate-200">
                Review Restock List
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
