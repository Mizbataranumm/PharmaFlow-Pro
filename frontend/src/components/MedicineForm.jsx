import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../utils/status';

const EMPTY = { name: '', category: 'tablet', quantity: '', minThreshold: '', expiryDate: '', notes: '' };

const Field = ({ label, name, children, error }) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default function MedicineForm({ medicine, onSave, onClose }) {
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (medicine) {
      const d = new Date(medicine.expiryDate);
      const iso = d.toISOString().slice(0, 10);
      setForm({
        name:         medicine.name         || '',
        category:     medicine.category     || 'tablet',
        quantity:     String(medicine.quantity    ?? ''),
        minThreshold: String(medicine.minThreshold ?? ''),
        expiryDate:   iso,
        notes:        medicine.notes        || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [medicine]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                           e.name         = 'Required';
    if (form.quantity === '')                        e.quantity     = 'Required';
    else if (isNaN(form.quantity) || +form.quantity < 0) e.quantity = 'Must be ≥ 0';
    if (!form.minThreshold)                          e.minThreshold = 'Required';
    else if (+form.minThreshold < 1)                 e.minThreshold = 'Must be ≥ 1';
    if (!form.expiryDate)                            e.expiryDate   = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        quantity:     Number(form.quantity),
        minThreshold: Number(form.minThreshold),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              {medicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Name */}
            <Field label="Medicine Name *" name="name" error={errors.name}>
              <input
                type="text" value={form.name} onChange={set('name')}
                placeholder="e.g. Paracetamol 500mg"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </Field>

            {/* Category */}
            <Field label="Category *" name="category">
              <select value={form.category} onChange={set('category')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition bg-white capitalize">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>

            {/* Quantity + Min Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity *" error={errors.quantity}>
                <input type="number" min="0" value={form.quantity} onChange={set('quantity')}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </Field>
              <Field label="Min Threshold *" error={errors.minThreshold}>
                <input type="number" min="1" value={form.minThreshold} onChange={set('minThreshold')}
                  placeholder="10"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </Field>
            </div>

            {/* Expiry Date */}
            <Field label="Expiry Date *" error={errors.expiryDate}>
              <input type="date" value={form.expiryDate} onChange={set('expiryDate')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </Field>

            {/* Notes */}
            <Field label="Notes (optional)">
              <textarea value={form.notes} onChange={set('notes')} rows={2}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
              />
            </Field>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-[2] px-4 py-2.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Saving…' : medicine ? 'Save Changes' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
