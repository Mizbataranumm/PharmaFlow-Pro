import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { medicinesAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MedicineForm from '../components/MedicineForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { expiryLabel, getDaysToExpiry, CATEGORIES } from '../utils/status';
import { Plus, Search, Pencil, Trash2, RefreshCw, PackageX, FileUp, Database, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';

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
  const [bulkLoading,setBulkLoading]=useState(false);
  const [showBulkMenu,setShowBulkMenu]=useState(false);

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

  const handleSampleData = async () => {
    setBulkLoading(true);
    setShowBulkMenu(false);
    try {
      const samples = [
        { name: 'Paracetamol 500mg', category: 'tablet', quantity: 150, minThreshold: 50 },
        { name: 'Amoxicillin 250mg', category: 'capsule', quantity: 12, minThreshold: 20 },
        { name: 'Ibuprofen 400mg', category: 'tablet', quantity: 80, minThreshold: 30 },
        { name: 'Cetirizine 10mg', category: 'tablet', quantity: 200, minThreshold: 40 },
        { name: 'Guaifenesin Syrup', category: 'syrup', quantity: 5, minThreshold: 10 },
        { name: 'Salbutamol Inhaler', category: 'inhaler', quantity: 15, minThreshold: 10 },
        { name: 'Insulin Glargine', category: 'injection', quantity: 8, minThreshold: 15 },
        { name: 'Hydrocortisone 1%', category: 'ointment', quantity: 25, minThreshold: 10 },
        { name: 'Metformin 500mg', category: 'tablet', quantity: 300, minThreshold: 100 },
        { name: 'Omeprazole 20mg', category: 'capsule', quantity: 60, minThreshold: 30 }
      ].map(m => ({
        ...m,
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
      }));

      await medicinesAPI.bulkCreate(samples);
      toast.success('Sample data generated!');
      load();
    } catch (_) { toast.error('Failed to generate sample data'); }
    setBulkLoading(false);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowBulkMenu(false);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      setBulkLoading(true);
      try {
        const text = event.target.result;
        const rows = text.split('\n').slice(1); // skip header
        const data = rows.filter(r => r.trim()).map(r => {
          const [name, category, quantity, minThreshold, expiryDate, notes] = r.split(',').map(s => s.trim());
          return { name, category: category?.toLowerCase(), quantity, minThreshold, expiryDate, notes };
        });

        if (data.length === 0) throw new Error('No valid data found');
        await medicinesAPI.bulkCreate(data);
        toast.success(`Successfully imported ${data.length} items`);
        load();
      } catch (err) {
        toast.error(err.message || 'Import failed. Check CSV format.');
      }
      setBulkLoading(false);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const openEdit = (m) => { setEditMed(m); setShowForm(true); };
  const openAdd  = () => { setEditMed(null); setShowForm(true); };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{medicines.length} medicines tracked</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Database size={16} className="text-slate-400" />
              {bulkLoading ? 'Processing…' : 'Bulk Actions'}
              <ChevronDown size={14} className={`transition-transform ${showBulkMenu ? 'rotate-180' : ''}`} />
            </button>

            {showBulkMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowBulkMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                  <button onClick={handleSampleData} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Database size={15} className="text-blue-500" />
                    Fill Sample Data
                  </button>
                  <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileUp size={15} className="text-green-500" />
                    Import CSV
                    <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                  </label>
                </div>
              </>
            )}
          </div>

          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/20">
            <Plus size={16} /> Add Medicine
          </button>
        </div>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Medicine','Category','Qty','Min Threshold','Expiry','Status','Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-3 w-48" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><Skeleton className="h-7 w-7 rounded-lg" /><Skeleton className="h-7 w-7 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <PackageX size={32} className="text-slate-400" />
                      </div>
                      <div className="text-base font-semibold text-slate-800 mb-1">No medicines found</div>
                      <div className="text-sm text-slate-500 mb-6">
                        We couldn't find anything matching your filters. Try adjusting them or add a new medicine.
                      </div>
                      <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg transition-colors">
                        <Plus size={16} /> Add New Medicine
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                medicines.map((m) => {
                  const days     = getDaysToExpiry(m.expiryDate);
                  const expColor = days < 0 ? 'text-red-500 font-medium' : days <= 7 ? 'text-yellow-600 font-medium' : 'text-slate-500';
                  const pct      = Math.min(100, Math.round((m.quantity / Math.max(1, m.minThreshold * 2)) * 100));
                  const barColor = m.status === 'instock' ? 'bg-green-400' : m.status === 'low' ? 'bg-yellow-400' : m.status === 'critical' ? 'bg-red-400' : 'bg-slate-300';
                  return (
                    <tr key={m._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                        {m.notes && <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{m.notes}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize border border-slate-200">{m.category}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-bold text-slate-700">{m.quantity}</div>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500 font-medium">{m.minThreshold}</td>
                      <td className={`px-5 py-3 text-xs ${expColor}`}>{expiryLabel(m.expiryDate)}</td>
                      <td className="px-5 py-3"><StatusBadge status={m.status || 'instock'} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(m)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors shadow-sm hover:shadow" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDelId(m._id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shadow-sm hover:shadow" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
    </motion.div>
  );
}
