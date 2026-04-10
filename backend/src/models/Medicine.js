const mongoose = require('mongoose');

// ── Medicine Schema ───────────────────────────────────────────────────────────
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['tablet', 'capsule', 'syrup', 'injection', 'inhaler', 'drops', 'ointment', 'other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'tablet',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    minThreshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [1, 'Minimum threshold must be at least 1'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: stock status ─────────────────────────────────────────────────────
medicineSchema.virtual('status').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today)              return 'expired';
  if (this.quantity === 0)         return 'critical';
  if (this.quantity <= 5)          return 'critical';
  if (this.quantity <= this.minThreshold) return 'low';
  return 'instock';
});

// ── Virtual: days until expiry ────────────────────────────────────────────────
medicineSchema.virtual('daysToExpiry').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
});

// ── Virtual: recommended reorder quantity ─────────────────────────────────────
medicineSchema.virtual('reorderQty').get(function () {
  return Math.max(0, this.minThreshold * 2 - this.quantity);
});

// ── Index for fast searches ────────────────────────────────────────────────────
medicineSchema.index({ name: 'text', category: 1 });
medicineSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
