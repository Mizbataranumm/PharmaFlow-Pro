import React, { useEffect, useState, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Printer, RefreshCw, ShoppingCart, CheckCircle } from 'lucide-react';

export default function ReorderPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.summary();
      setItems(data.data.reorderList);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => {
    const rows = items.map((m) => `
      <tr>
        <td>${m.name}</td>
        <td style="text-transform:capitalize">${m.category}</td>
        <td style="color:${m.quantity <= 5 ? '#dc2626' : '#374151'};font-weight:500">${m.quantity}</td>
        <td>${m.minThreshold}</td>
        <td style="color:#2563eb;font-weight:600">${m.reorderQty}</td>
        <td>${m.status.charAt(0).toUpperCase() + m.status.slice(1)}</td>
      </tr>`
    ).join('');
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>PharmaFlow – Reorder List</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
        h1  { font-size: 20px; margin-bottom: 4px; }
        p   { font-size: 13px; color: #888; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th  { text-align: left; padding: 8px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        td  { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; }
      </style></head>
      <body>
        <h1>PharmaFlow — Reorder List</h1>
        <p>Generated: ${new Date().toLocaleString()} &nbsp;·&nbsp; Total items: ${items.length}</p>
        <table>
          <thead><tr>
            <th>Medicine</th><th>Category</th><th>Current Qty</th>
            <th>Min Threshold</th><th>Reorder Qty</th><th>Status</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">Formula: Reorder Qty = (Min Threshold × 2) − Current Quantity</div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Reorder List</h1>
          <p className="text-sm text-slate-400 mt-0.5">Medicines requiring restocking or removal</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {items.length > 0 && (
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
              <Printer size={14} /> Print / Download
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      {items.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <ShoppingCart size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">{items.length} item{items.length > 1 ? 's' : ''} need attention</p>
            <p className="text-xs text-amber-600 mt-0.5">Reorder qty = (min threshold × 2) − current quantity</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          <RefreshCw size={15} className="animate-spin mr-2" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <p className="text-base font-medium text-slate-700">All stocked up!</p>
          <p className="text-sm text-slate-400 mt-1">No medicines need reordering right now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Medicine','Category','Current Qty','Min Threshold','Reorder Qty','Priority'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((m) => {
                  const rowBg = (m.status === 'critical' || m.status === 'expired') ? 'bg-red-50/40' : m.status === 'low' ? 'bg-yellow-50/40' : '';
                  return (
                    <tr key={m.id} className={`hover:bg-slate-50/50 transition ${rowBg}`}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{m.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full capitalize">{m.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${m.quantity <= 5 ? 'text-red-600' : 'text-slate-700'}`}>{m.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{m.minThreshold}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-blue-600">{m.reorderQty}</span>
                        <span className="text-xs text-slate-400 ml-1">units</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{items.length} items total</span>
            <span className="text-xs text-slate-400">Total units to order: <strong className="text-slate-600">{items.reduce((s, m) => s + m.reorderQty, 0)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
