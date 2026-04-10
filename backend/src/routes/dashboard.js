const express  = require('express');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/dashboard/summary ────────────────────────────────────────────────
// Returns aggregated stats and alerts for the dashboard
router.get('/summary', async (req, res) => {
  try {
    const all = await Medicine.find({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute stats using virtual fields
    const stats = {
      total:    all.length,
      instock:  0,
      low:      0,
      critical: 0,
      expired:  0,
    };

    const alerts = [];

    all.forEach((m) => {
      const status = m.status;
      stats[status] = (stats[status] || 0) + 1;

      const days = m.daysToExpiry;

      // Build alert list
      if (status === 'expired') {
        alerts.push({
          type:    'danger',
          message: `${m.name} expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`,
          medicine: { id: m._id, name: m.name, status },
        });
      } else if (status === 'critical') {
        alerts.push({
          type:    'danger',
          message: `${m.name} is critically low — only ${m.quantity} remaining`,
          medicine: { id: m._id, name: m.name, quantity: m.quantity, status },
        });
      } else if (days <= 7) {
        alerts.push({
          type:    'warning',
          message: `${m.name} expires in ${days} day${days === 1 ? '' : 's'}`,
          medicine: { id: m._id, name: m.name, daysToExpiry: days, status },
        });
      } else if (status === 'low') {
        alerts.push({
          type:    'warning',
          message: `${m.name} is low on stock (${m.quantity} remaining)`,
          medicine: { id: m._id, name: m.name, quantity: m.quantity, status },
        });
      }
    });

    // Reorder list: critical + low + expired
    const reorderList = all
      .filter((m) => ['critical', 'low', 'expired'].includes(m.status))
      .map((m) => ({
        id:           m._id,
        name:         m.name,
        category:     m.category,
        quantity:     m.quantity,
        minThreshold: m.minThreshold,
        reorderQty:   m.reorderQty,
        status:       m.status,
        expiryDate:   m.expiryDate,
      }));

    res.json({
      success: true,
      data: { stats, alerts, reorderList },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
