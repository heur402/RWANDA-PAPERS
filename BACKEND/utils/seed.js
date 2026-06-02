/**
 * Seed script - creates default admin and categories
 * Run once: node utils/seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin.model');
const Category = require('../models/Category.model');

const categories = [
  { name: 'Primary School', description: 'Past papers and notes for primary school students', icon: 'school' },
  { name: 'Secondary School', description: 'O-Level and A-Level resources', icon: 'book' },
  { name: 'TVET', description: 'Technical and Vocational Education and Training resources', icon: 'wrench' },
  { name: 'University', description: 'University course materials and past papers', icon: 'graduation-cap' },
  { name: 'National Exams', description: 'National examination past papers', icon: 'clipboard' },
  { name: 'Notes', description: 'Study notes and summaries', icon: 'file-text' },
  { name: 'Assignments', description: 'Past assignments and practicals', icon: 'pencil' },
  { name: 'Modules', description: 'Course modules and syllabi', icon: 'layers' },
  { name: 'Research Papers', description: 'Academic research and thesis papers', icon: 'search' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed categories
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Seed admin
    await Admin.deleteMany({});
    await Admin.create({
      name: 'Rwanda Papers Admin',
      email: 'admin@rwandapapers.rw',
      password: 'Admin@123',
      role: 'superadmin',
    });
    console.log('Admin created: admin@rwandapapers.rw / Admin@123');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
