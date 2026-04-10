import React, { useEffect, useState, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import { RefreshCw, Bell } from 'lucide-react';

const ALERT_STYLES = {
  danger:  { bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    dot: 'bg-red-400',    icon: '🚨' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400', icon: '⚠️' },
};

export default function AlertsPage() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.summary();
      setAlerts(data.data.alerts);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // auto-refresh every 15s
    return () => clearInterval(id);
  }, [load]);

  const dangers  = alerts.filter((a) => a.type === 'danger');
  const warnings = alerts.filter((a) => a.type === 'warning');

  return (
    <div className="fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Alerts</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {alerts.length === 0 ? 'All clear' : `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          <RefreshCw size={15} className="animate-spin mr-2" /> Loading…
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-green-500" />
          </div>
          <p className="text-base font-medium text-slate-700">All clear!</p>
          <p className="text-sm text-slate-400 mt-1">No alerts at this time. Inventory looks healthy.</p>
        </div>
      ) : (
        <>
          {/* Critical / Danger */}
          {dangers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-50">
                <span className="w-2 h-2 rounded-full bg-red-400 pulse-critical" />
                <h2 className="text-sm font-semibold text-red-600">Critical Alerts ({dangers.length})</h2>
              </div>
              <div className="p-4 space-y-2">
                {dangers.map((a, i) => {
                  const s = ALERT_STYLES.danger;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl ${s.bg} border ${s.border}`}>
                      <span className="text-base mt-0.5">{s.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${s.text}`}>{a.message}</p>
                        {a.medicine?.quantity !== undefined && (
                          <p className="text-xs text-red-400 mt-0.5">{a.medicine.quantity} units remaining</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-50">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <h2 className="text-sm font-semibold text-yellow-600">Warnings ({warnings.length})</h2>
              </div>
              <div className="p-4 space-y-2">
                {warnings.map((a, i) => {
                  const s = ALERT_STYLES.warning;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl ${s.bg} border ${s.border}`}>
                      <span className="text-base mt-0.5">{s.icon}</span>
                      <p className={`text-sm ${s.text}`}>{a.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
