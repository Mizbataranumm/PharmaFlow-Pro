const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type:     String,
      required: [true, 'Username is required'],
      unique:   true,
      trim:     true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:   false, // never return password in queries by default
    },
    name: {
      type:    String,
      default: '',
    },
    role: {
      type:    String,
      enum:    ['admin', 'staff'],
      default: 'staff',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
