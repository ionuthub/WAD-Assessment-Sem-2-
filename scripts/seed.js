// Seed script to populate discoverhealth.db with initial users and healthcare resources
// Run once via: node scripts/seed.js

import db from '../db/db.js';

console.log('Seeding database...');

try {
  db.exec(`ALTER TABLE healthcare_resources RENAME COLUMN recommendations TO likes;`);
  console.log('Column "recommendations" renamed to "likes"');
} catch (err) {
  if (err.message.includes('no such column')) {
    // ignore if column doesn't exist
  } else {
    throw err;
  }
}

db.exec(`
  PRAGMA foreign_keys = ON;

  -- USERS (simple demo passwords, not hashed)
  INSERT OR IGNORE INTO users (username, password, isAdmin) VALUES
    ('jsmith', 'demo', 0),
    ('admin',  'demo', 1);

  -- HEALTHCARE RESOURCES
  INSERT OR IGNORE INTO healthcare_resources
    (name, category, country, description, region, lat, lon, likes)
  VALUES
    ('Smile Dental Care', 'Dentist', 'UK',
     'Full-service dental office.', 'Manchester', 53.4808, -2.2426, 8),
    ('North Care Clinic', 'Clinic', 'UK',
     'Family and pediatric services.', 'Manchester', 53.4875, -2.2320, 10),
    ('City Health Clinic', 'Clinic', 'UK',
     'General health services and checkups.', 'London', 51.5074, -0.1278, 18);
`);

console.log('Seed data inserted successfully.');
process.exit();
