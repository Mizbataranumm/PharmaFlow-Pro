import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { medicinesAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MedicineForm from '../components/MedicineForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { expiryLabel, getDaysToExpiry, CATEGORIES } from '../utils/status';
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react';

export default function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterSt,  setFilterSt]  = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editMed,   setEditMed]   = useState(null);
  const [delId,     setDelId]     = useState(null);
  const [delLoading,setDelLoading]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search   = search;
      if (filterCat) params.category = filterCat;
      if (filterSt)  params.status   = filterSt;
      const { data } = await medicinesAPI.getAll(params);
      setMedicines(data.data);
    } catch (_) { toast.error('Failed to load medicines'); }
    setLoading(false);
  }, [search, filterCat, filterSt]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSave = async (formData) => {
    try {
      if (editMed) {
        await medicinesAPI.update(editMed._id, formData);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(formData);
        toast.success('Medicine added');
      }
      setShowForm(false);
      setEditMed(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      throw err;
    }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await medicinesAPI.remove(delId);
      toast.success('Medicine deleted');
      setDelId(null);
      load();
    } catch (_) { toast.error('Delete failed'); }
    setDelLoading(false);
  };

  const openEdit = (m) => { setEditMed(m); setShowForm(true); };
  const openAdd  = () => { setEditMed(null); setShowForm(true); };

  return (
    <div className="fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-400 mt-0.5">{medicines.length} medicines total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
          <Plus size={15} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search medicines…" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white capitalize min-w-36">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={filterSt} onChange={(e) => setFilterSt(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-36">
          <option value="">All Status</option>
          <option value="instock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="critical">Critical</option>
          <option value="expired">Expired</option>
        </select>
        <button onClick={load} className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition flex items-center gap-1.5">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            <RefreshCw size={15} className="animate-spin mr-2" /> Loading…
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No medicines found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Medicine','Category','Qty','Min Threshold','Expiry','Status','Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {medicines.map((m) => {
                  const days     = getDaysToExpiry(m.expiryDate);
                  const expColor = days < 0 ? 'text-red-500 font-medium' : days <= 7 ? 'text-yellow-600 font-medium' : 'text-slate-400';
                  const pct      = Math.min(100, Math.round((m.quantity / Math.max(1, m.minThreshold * 2)) * 100));
                  const barColor = m.status === 'instock' ? 'bg-green-400' : m.status === 'low' ? 'bg-yellow-400' : m.status === 'critical' ? 'bg-red-400' : 'bg-slate-300';
                  return (
                    <tr key={m._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-700">{m.name}</div>
                        {m.notes && <div className="text-xs text-slate-400 truncate max-w-48">{m.notes}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full capitalize">{m.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-700">{m.quantity}</div>
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{m.minThreshold}</td>
                      <td className={`px-4 py-3 text-xs ${expColor}`}>{expiryLabel(m.expiryDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status || 'instock'} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDelId(m._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <MedicineForm
          medicine={editMed}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditMed(null); }}
        />
      )}
      {delId && (
        <ConfirmDialog
          message={`This will permanently remove "${medicines.find((m) => m._id === delId)?.name}" from inventory.`}
          onConfirm={handleDelete}
          onCancel={() => setDelId(null)}
          loading={delLoading}
        />
      )}
    </div>
  );
}
