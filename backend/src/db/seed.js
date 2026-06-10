require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function seed() {
  console.log('Seeding database...');

  // Users
  const adminHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const ownerHash = await bcrypt.hash('Owner@123', SALT_ROUNDS);
  const tenantHash = await bcrypt.hash('Tenant@123', SALT_ROUNDS);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password_hash, role, first_name, last_name, phone, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  insertUser.run('admin', 'admin@apartment.com', adminHash, 'Admin', 'System', 'Admin', '9999000001');
  insertUser.run('owner1', 'owner1@email.com', ownerHash, 'Owner', 'Rajesh', 'Kumar', '9876543210');
  insertUser.run('owner2', 'owner2@email.com', ownerHash, 'Owner', 'Priya', 'Sharma', '9876543211');
  insertUser.run('tenant1', 'tenant1@email.com', tenantHash, 'Tenant', 'Amit', 'Singh', '9876500001');
  insertUser.run('tenant2', 'tenant2@email.com', tenantHash, 'Tenant', 'Sneha', 'Patel', '9876500002');
  console.log('  Users seeded');

  // Blocks
  const insertBlock = db.prepare(`INSERT OR IGNORE INTO blocks (name, description, total_floors) VALUES (?, ?, ?)`);
  insertBlock.run('A', 'Block A - East Wing', 5);
  insertBlock.run('B', 'Block B - West Wing', 5);
  insertBlock.run('Tower 1', 'Main Tower', 12);
  console.log('  Blocks seeded');

  const blockA = db.prepare("SELECT id FROM blocks WHERE name = 'A'").get();
  const blockB = db.prepare("SELECT id FROM blocks WHERE name = 'B'").get();
  const tower1 = db.prepare("SELECT id FROM blocks WHERE name = 'Tower 1'").get();

  // Apartments
  const insertApt = db.prepare(`
    INSERT OR IGNORE INTO apartments (flat_number, block_id, floor, flat_type, area_sqft, facing, status, monthly_maintenance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  // Block A
  insertApt.run('101', blockA.id, 1, '2BHK', 950, 'East', 'Occupied', 2500);
  insertApt.run('102', blockA.id, 1, '1BHK', 650, 'West', 'Vacant', 1800);
  insertApt.run('201', blockA.id, 2, '3BHK', 1400, 'North', 'Occupied', 3500);
  insertApt.run('202', blockA.id, 2, '2BHK', 980, 'South', 'Vacant', 2500);
  insertApt.run('301', blockA.id, 3, '2BHK', 960, 'East', 'Occupied', 2500);
  insertApt.run('302', blockA.id, 3, '3BHK', 1450, 'North', 'Vacant', 3500);
  // Block B
  insertApt.run('101', blockB.id, 1, '1BHK', 680, 'East', 'Occupied', 1800);
  insertApt.run('102', blockB.id, 1, '2BHK', 920, 'West', 'Vacant', 2500);
  insertApt.run('201', blockB.id, 2, '2BHK', 940, 'North', 'Occupied', 2500);
  insertApt.run('202', blockB.id, 2, '3BHK', 1380, 'South', 'Vacant', 3500);
  // Tower 1
  insertApt.run('501', tower1.id, 5, '3BHK', 1600, 'NE', 'Occupied', 4500);
  insertApt.run('502', tower1.id, 5, '3BHK', 1580, 'NW', 'Vacant', 4500);
  insertApt.run('1001', tower1.id, 10, '4BHK', 2400, 'North', 'Occupied', 7000);
  insertApt.run('1201', tower1.id, 12, 'Penthouse', 3200, 'North', 'Vacant', 10000);
  console.log('  Apartments seeded');

  // Owners
  const u1 = db.prepare("SELECT id FROM users WHERE username = 'owner1'").get();
  const u2 = db.prepare("SELECT id FROM users WHERE username = 'owner2'").get();
  const insertOwner = db.prepare(`
    INSERT OR IGNORE INTO owners (user_id, first_name, last_name, email, phone, aadhar_number, city, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOwner.run(u1.id, 'Rajesh', 'Kumar', 'owner1@email.com', '9876543210', '1234-5678-9012', 'Hyderabad', 'Telangana');
  insertOwner.run(u2.id, 'Priya', 'Sharma', 'owner2@email.com', '9876543211', '2345-6789-0123', 'Hyderabad', 'Telangana');
  insertOwner.run(null, 'Suresh', 'Reddy', 'owner3@email.com', '9876543212', '3456-7890-1234', 'Hyderabad', 'Telangana');
  insertOwner.run(null, 'Anita', 'Joshi', 'owner4@email.com', '9876543213', '4567-8901-2345', 'Hyderabad', 'Telangana');
  insertOwner.run(null, 'Vikram', 'Nair', 'owner5@email.com', '9876543214', '5678-9012-3456', 'Bangalore', 'Karnataka');
  console.log('  Owners seeded');

  // Apartment-Owner assignments
  const aA101 = db.prepare("SELECT id FROM apartments WHERE flat_number = '101' AND block_id = ?").get(blockA.id);
  const aA201 = db.prepare("SELECT id FROM apartments WHERE flat_number = '201' AND block_id = ?").get(blockA.id);
  const aB101 = db.prepare("SELECT id FROM apartments WHERE flat_number = '101' AND block_id = ?").get(blockB.id);
  const o1 = db.prepare("SELECT id FROM owners WHERE email = 'owner1@email.com'").get();
  const o2 = db.prepare("SELECT id FROM owners WHERE email = 'owner2@email.com'").get();

  const insertAO = db.prepare(`INSERT OR IGNORE INTO apartment_owners (apartment_id, owner_id, ownership_from, is_current, ownership_share) VALUES (?, ?, ?, 1, 100)`);
  if (aA101 && o1) insertAO.run(aA101.id, o1.id, '2020-01-01');
  if (aA201 && o2) insertAO.run(aA201.id, o2.id, '2021-03-15');
  if (aB101 && o1) insertAO.run(aB101.id, o1.id, '2019-06-01');
  console.log('  Apartment-Owner assignments seeded');

  // Tenants
  const tu1 = db.prepare("SELECT id FROM users WHERE username = 'tenant1'").get();
  const tu2 = db.prepare("SELECT id FROM users WHERE username = 'tenant2'").get();
  const aA301 = db.prepare("SELECT id FROM apartments WHERE flat_number = '301' AND block_id = ?").get(blockA.id);
  const aB201 = db.prepare("SELECT id FROM apartments WHERE flat_number = '201' AND block_id = ?").get(blockB.id);

  const insertTenant = db.prepare(`
    INSERT OR IGNORE INTO tenants (user_id, apartment_id, first_name, last_name, email, phone, move_in_date, rent_amount, deposit_amount, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  if (aA101 && tu1) insertTenant.run(tu1.id, aA101.id, 'Amit', 'Singh', 'tenant1@email.com', '9876500001', '2023-01-01', 15000, 30000);
  if (aA201 && tu2) insertTenant.run(tu2.id, aA201.id, 'Sneha', 'Patel', 'tenant2@email.com', '9876500002', '2023-03-01', 22000, 44000);
  if (aA301) insertTenant.run(null, aA301.id, 'Ravi', 'Verma', 'ravi.verma@email.com', '9876500003', '2022-11-15', 18000, 36000);
  if (aB201) insertTenant.run(null, aB201.id, 'Meena', 'Gupta', 'meena.gupta@email.com', '9876500004', '2023-06-01', 16000, 32000);
  console.log('  Tenants seeded');

  // Amenities
  const insertAmenity = db.prepare(`
    INSERT OR IGNORE INTO amenities (name, category, description, capacity, monthly_cost, status, booking_required)
    VALUES (?, ?, ?, ?, ?, 'Active', ?)
  `);
  insertAmenity.run('Swimming Pool', 'Recreation', 'Outdoor swimming pool with changing rooms', 50, 15000, 1);
  insertAmenity.run('Gymnasium', 'Health', 'Fully equipped gym with cardio and weight training', 30, 8000, 0);
  insertAmenity.run('Club House', 'Recreation', 'Community hall for events and meetings', 200, 5000, 1);
  insertAmenity.run('CCTV Security', 'Security', '24/7 CCTV surveillance across premises', null, 12000, 0);
  insertAmenity.run("Children's Play Area", 'Recreation', 'Safe play area for children', 40, 2000, 0);
  insertAmenity.run('Visitor Parking', 'Transport', 'Dedicated visitor parking slots', 20, 1000, 0);
  console.log('  Amenities seeded');

  // Expense categories
  const insertCat = db.prepare(`INSERT OR IGNORE INTO expense_categories (name, description) VALUES (?, ?)`);
  insertCat.run('Security', 'Security staff and CCTV maintenance');
  insertCat.run('Housekeeping', 'Cleaning and housekeeping services');
  insertCat.run('Electricity', 'Common area electricity bills');
  insertCat.run('Water', 'Water supply and tank maintenance');
  insertCat.run('Repairs', 'General repair and maintenance work');
  insertCat.run('Gardening', 'Landscaping and garden maintenance');
  insertCat.run('Lift Maintenance', 'Elevator service and AMC');
  insertCat.run('Miscellaneous', 'Other expenses');
  console.log('  Expense categories seeded');

  // Sample expenses
  const cats = db.prepare('SELECT id, name FROM expense_categories').all();
  const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));
  const adminUser = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();

  const insertExp = db.prepare(`
    INSERT OR IGNORE INTO expenses (category_id, title, amount, expense_date, month_year, approval_status, vendor_name, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, 'Approved', ?, ?, ?)
  `);
  const months = ['2026-03', '2026-04', '2026-05'];
  months.forEach(m => {
    const d = `${m}-05`;
    insertExp.run(catMap['Security'], `Security Staff - ${m}`, 25000, d, m, 'ABC Security', adminUser.id, adminUser.id);
    insertExp.run(catMap['Housekeeping'], `Housekeeping - ${m}`, 18000, d, m, 'CleanPro Services', adminUser.id, adminUser.id);
    insertExp.run(catMap['Electricity'], `Electricity Bill - ${m}`, 35000, `${m}-10`, m, 'TSPDCL', adminUser.id, adminUser.id);
    insertExp.run(catMap['Water'], `Water Bill - ${m}`, 8000, `${m}-08`, m, 'HMWSSB', adminUser.id, adminUser.id);
    insertExp.run(catMap['Lift Maintenance'], `Lift AMC - ${m}`, 12000, `${m}-01`, m, 'OtisElevators', adminUser.id, adminUser.id);
  });
  console.log('  Expenses seeded');

  // Maintenance bills (last 3 months)
  const allApts = db.prepare("SELECT id, monthly_maintenance FROM apartments WHERE status = 'Occupied' AND is_deleted = 0").all();
  const insertBill = db.prepare(`
    INSERT OR IGNORE INTO maintenance_bills (apartment_id, bill_month, base_amount, total_amount, due_date, payment_status, receipt_number, generated_by, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  months.forEach((m, mi) => {
    const dueDate = `${m}-10`;
    allApts.forEach((apt, ai) => {
      const receipt = `RCP-${m.replace('-', '')}-${apt.id}-${ai + 1}`;
      const status = mi < 2 ? 'Paid' : 'Pending';
      insertBill.run(apt.id, m, apt.monthly_maintenance, apt.monthly_maintenance, dueDate, status, receipt, adminUser.id, adminUser.id, adminUser.id);
    });
  });
  // Update paid bills
  db.prepare(`
    UPDATE maintenance_bills SET paid_amount = total_amount, paid_date = date(due_date, '+5 days'), payment_mode = 'UPI'
    WHERE payment_status = 'Paid'
  `).run();
  console.log('  Maintenance bills seeded');

  // Sample notices
  const insertNotice = db.prepare(`
    INSERT OR IGNORE INTO notices (title, content, notice_type, target_role, is_pinned, is_active, created_by, updated_by)
    VALUES (?, ?, ?, 'All', ?, 1, ?, ?)
  `);
  insertNotice.run('Welcome to Our Community Portal', 'Dear Residents, welcome to our new apartment management portal. You can now view your maintenance bills, submit requests, and stay updated with community notices.', 'General', 1, adminUser.id, adminUser.id);
  insertNotice.run('June 2026 Maintenance Due', 'Maintenance charges for June 2026 are now due. Please pay by 10th June to avoid penalties.', 'Financial', 0, adminUser.id, adminUser.id);
  insertNotice.run('Gym Timing Change', 'The gymnasium will now be open from 5:30 AM to 10:00 PM effective from 1st June 2026.', 'General', 0, adminUser.id, adminUser.id);
  console.log('  Notices seeded');

  // Sample alert
  db.prepare(`
    INSERT OR IGNORE INTO alerts (title, message, alert_type, severity, start_time, end_time, is_active, created_by, updated_by)
    VALUES ('Water Supply Disruption', 'Water supply will be disrupted on 12th June from 10 AM to 2 PM due to tank cleaning.', 'Water Shutdown', 'Warning', '2026-06-12 10:00', '2026-06-12 14:00', 1, ?, ?)
  `).run(adminUser.id, adminUser.id);
  console.log('  Alerts seeded');

  console.log('\nDatabase seeding complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:  admin / Admin@123');
  console.log('  Owner:  owner1 / Owner@123');
  console.log('  Tenant: tenant1 / Tenant@123');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
