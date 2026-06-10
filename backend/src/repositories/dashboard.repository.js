const db = require('../config/database');

const getAdminDashboard = () => {
  const totalFlats = db.prepare("SELECT COUNT(*) as count FROM apartments WHERE is_deleted = 0").get().count;
  const occupiedFlats = db.prepare("SELECT COUNT(*) as count FROM apartments WHERE status = 'Occupied' AND is_deleted = 0").get().count;
  const vacantFlats = db.prepare("SELECT COUNT(*) as count FROM apartments WHERE status = 'Vacant' AND is_deleted = 0").get().count;
  const totalOwners = db.prepare("SELECT COUNT(*) as count FROM owners WHERE is_deleted = 0").get().count;
  const totalTenants = db.prepare("SELECT COUNT(*) as count FROM tenants WHERE is_active = 1 AND is_deleted = 0").get().count;

  const pendingBills = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount - paid_amount), 0) as amount
    FROM maintenance_bills WHERE payment_status IN ('Pending','Overdue') AND is_deleted = 0
  `).get();

  const monthlyCollection = db.prepare(`
    SELECT bill_month, SUM(paid_amount) as collected, SUM(total_amount) as billed
    FROM maintenance_bills WHERE is_deleted = 0
    GROUP BY bill_month ORDER BY bill_month DESC LIMIT 6
  `).all();

  const expenseByCategory = db.prepare(`
    SELECT ec.name as category, SUM(e.amount) as total
    FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
    WHERE e.is_deleted = 0 AND e.approval_status = 'Approved'
      AND e.month_year >= strftime('%Y-%m', date('now', '-6 months'))
    GROUP BY ec.name ORDER BY total DESC
  `).all();

  const recentRequests = db.prepare(`
    SELECT mr.*, a.flat_number, b.name as block_name
    FROM maintenance_requests mr
    JOIN apartments a ON mr.apartment_id = a.id
    JOIN blocks b ON a.block_id = b.id
    WHERE mr.is_deleted = 0
    ORDER BY mr.created_at DESC LIMIT 5
  `).all();

  const requestStatusCount = db.prepare(`
    SELECT status, COUNT(*) as count FROM maintenance_requests WHERE is_deleted = 0 GROUP BY status
  `).all();

  return {
    stats: { totalFlats, occupiedFlats, vacantFlats, totalOwners, totalTenants, pendingBills },
    monthlyCollection: monthlyCollection.reverse(),
    expenseByCategory,
    recentRequests,
    requestStatusCount,
  };
};

const getOwnerDashboard = (userId) => {
  const owner = db.prepare("SELECT * FROM owners WHERE user_id = ? AND is_deleted = 0").get(userId);
  if (!owner) return { apartments: [], bills: [], notices: [] };

  const apartments = db.prepare(`
    SELECT a.*, b.name as block_name, ao.ownership_from
    FROM apartment_owners ao
    JOIN apartments a ON ao.apartment_id = a.id
    JOIN blocks b ON a.block_id = b.id
    WHERE ao.owner_id = ? AND ao.is_current = 1 AND a.is_deleted = 0
  `).all(owner.id);

  const pendingBills = db.prepare(`
    SELECT mb.*, a.flat_number, b.name as block_name
    FROM maintenance_bills mb
    JOIN apartments a ON mb.apartment_id = a.id
    JOIN blocks b ON a.block_id = b.id
    JOIN apartment_owners ao ON ao.apartment_id = a.id
    WHERE ao.owner_id = ? AND ao.is_current = 1
      AND mb.payment_status IN ('Pending','Overdue')
      AND mb.is_deleted = 0
    ORDER BY mb.due_date
    LIMIT 5
  `).all(owner.id);

  const notices = db.prepare(`
    SELECT * FROM notices WHERE is_deleted = 0 AND is_active = 1
      AND (target_role = 'All' OR target_role = 'Owner')
    ORDER BY is_pinned DESC, created_at DESC LIMIT 5
  `).all();

  return { owner, apartments, pendingBills, notices };
};

const getTenantDashboard = (userId) => {
  const tenant = db.prepare("SELECT * FROM tenants WHERE user_id = ? AND is_active = 1 AND is_deleted = 0").get(userId);
  if (!tenant) return { apartment: null, bills: [], notices: [], requests: [] };

  const apartment = tenant.apartment_id
    ? db.prepare(`
        SELECT a.*, b.name as block_name FROM apartments a
        JOIN blocks b ON a.block_id = b.id WHERE a.id = ?
      `).get(tenant.apartment_id)
    : null;

  const bills = db.prepare(`
    SELECT * FROM maintenance_bills WHERE apartment_id = ? AND is_deleted = 0
    ORDER BY bill_month DESC LIMIT 6
  `).all(tenant.apartment_id || 0);

  const notices = db.prepare(`
    SELECT * FROM notices WHERE is_deleted = 0 AND is_active = 1
      AND (target_role = 'All' OR target_role = 'Tenant')
    ORDER BY is_pinned DESC, created_at DESC LIMIT 5
  `).all();

  const requests = db.prepare(`
    SELECT * FROM maintenance_requests WHERE tenant_id = ? AND is_deleted = 0
    ORDER BY created_at DESC LIMIT 5
  `).all(tenant.id);

  const alerts = db.prepare(`
    SELECT * FROM alerts WHERE is_deleted = 0 AND is_active = 1
    ORDER BY created_at DESC LIMIT 3
  `).all();

  return { tenant, apartment, bills, notices, requests, alerts };
};

module.exports = { getAdminDashboard, getOwnerDashboard, getTenantDashboard };
