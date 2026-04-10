

require("dotenv").config({ path: "../../.env" });

const mongoose = require("mongoose");

const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: require('path').join(__dirname, '../../.env') });

const Medicine = require('../models/Medicine');
const User = require('../models/User');

const today = new Date();
const d = (n) => {
  const x = new Date(today);
  x.setDate(x.getDate() + n);
  return x;
};

const sampleMedicines = [
  { name: 'Paracetamol 500mg', category: 'tablet', quantity: 4, minThreshold: 20, expiryDate: d(45) },
  { name: 'Amoxicillin 250mg', category: 'capsule', quantity: 0, minThreshold: 15, expiryDate: d(-5) },
  { name: 'Ibuprofen 400mg', category: 'tablet', quantity: 8, minThreshold: 10, expiryDate: d(2) },
  { name: 'Cetirizine Syrup', category: 'syrup', quantity: 25, minThreshold: 10, expiryDate: d(120) },
  { name: 'Insulin Glargine', category: 'injection', quantity: 3, minThreshold: 5, expiryDate: d(30) },
  { name: 'Omeprazole 20mg', category: 'capsule', quantity: 60, minThreshold: 20, expiryDate: d(200) },
  { name: 'Metformin 500mg', category: 'tablet', quantity: 2, minThreshold: 30, expiryDate: d(-10) },
  { name: 'Salbutamol Inhaler', category: 'inhaler', quantity: 12, minThreshold: 5, expiryDate: d(60) },
  { name: 'Ciprofloxacin 500mg', category: 'tablet', quantity: 45, minThreshold: 15, expiryDate: d(90) },
  { name: 'Atorvastatin 10mg', category: 'tablet', quantity: 5, minThreshold: 10, expiryDate: d(180) },
  { name: 'Ranitidine Syrup', category: 'syrup', quantity: 1, minThreshold: 8, expiryDate: d(-2) },
  { name: 'Diclofenac Gel', category: 'ointment', quantity: 18, minThreshold: 5, expiryDate: d(365) },
];

const sampleUsers = [
  { username: 'admin', password: 'clinic123', role: 'admin', name: 'Dr. Admin' },
  { username: 'staff', password: 'staff456', role: 'staff', name: 'Staff User' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Medicine.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Seed users with hashed passwords
    const usersToInsert = sampleUsers;

    await User.create(usersToInsert);
    console.log(`✅ Seeded ${usersToInsert.length} users`);

    // Seed medicines
    await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Seeded ${sampleMedicines.length} medicines`);

    console.log('\nSeed complete! Login credentials:');
    console.log('  admin / clinic123');
    console.log('  staff / staff456');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
