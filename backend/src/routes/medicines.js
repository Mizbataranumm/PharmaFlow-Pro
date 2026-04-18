const express  = require('express');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All medicine routes require authentication
router.use(protect);

// ── GET /api/medicines ────────────────────────────────────────────────────────
// Query params: search, category, status, sort, page, limit
router.get('/', async (req, res) => {
  try {
    const { search, category, status, sort = '-createdAt', page = 1, limit = 50 } = req.query;

    const filter = { user: req.user.id };

    // Text search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Fetch all that match text/category first, then filter by virtual status
    let medicines = await Medicine.find(filter).sort(sort);

    // Filter by stock status (virtual field — must be done in JS)
    if (status) {
      medicines = medicines.filter((m) => m.status === status);
    }

    // Pagination
    const total  = medicines.length;
    const skip   = (Number(page) - 1) * Number(limit);
    const paged  = medicines.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      count:   paged.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      data:    paged,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/medicines/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user.id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/medicines ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, minThreshold, expiryDate, notes } = req.body;

    const medicine = await Medicine.create({
      user: req.user.id,
      name,
      category,
      quantity:     Number(quantity),
      minThreshold: Number(minThreshold),
      expiryDate:   new Date(expiryDate),
      notes:        notes || '',
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    // Handle Mongoose validation errors nicely
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/medicines/bulk ──────────────────────────────────────────────────
router.post('/bulk', async (req, res) => {
  try {
    const medicinesData = req.body;

    if (!Array.isArray(medicinesData)) {
      return res.status(400).json({ success: false, message: 'Data must be an array' });
    }

    // Add user ID to each medicine
    const medicinesWithUser = medicinesData.map((m) => ({
      ...m,
      user: req.user.id,
      quantity: Number(m.quantity || 0),
      minThreshold: Number(m.minThreshold || 10),
      expiryDate: new Date(m.expiryDate || new Date().setFullYear(new Date().getFullYear() + 1)),
    }));

    const medicines = await Medicine.insertMany(medicinesWithUser);

    res.status(201).json({ 
      success: true, 
      count: medicines.length, 
      data: medicines 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/medicines/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, category, quantity, minThreshold, expiryDate, notes } = req.body;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        name,
        category,
        quantity:     Number(quantity),
        minThreshold: Number(minThreshold),
        expiryDate:   new Date(expiryDate),
        notes:        notes || '',
      },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.json({ success: true, data: medicine });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/medicines/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, message: 'Medicine deleted successfully', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
