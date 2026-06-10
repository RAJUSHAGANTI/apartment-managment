const db = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getMaintenanceReport = (query) => {
  const { from_month, to_month } = query;
  const conditions = ['mb.is_deleted = 0'];
  const params = [];
  if (from_month) { conditions.push('mb.bill_month >= ?'); params.push(from_month); }
  if (to_month) { conditions.push('mb.bill_month <= ?'); params.push(to_month); }

  const rows = db.prepare(`
    SELECT mb.*, a.flat_number, b.name as block_name
    FROM maintenance_bills mb
    JOIN apartments a ON mb.apartment_id = a.id
    JOIN blocks b ON a.block_id = b.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY mb.bill_month, b.name, a.flat_number
  `).all(...params);

  const summary = db.prepare(`
    SELECT bill_month,
      SUM(total_amount) as billed,
      SUM(paid_amount) as collected,
      SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN payment_status IN ('Pending','Overdue') THEN 1 ELSE 0 END) as pending_count
    FROM maintenance_bills mb WHERE ${conditions.join(' AND ')}
    GROUP BY bill_month ORDER BY bill_month
  `).all(...params);

  return { rows, summary };
};

const getExpenseReport = (query) => {
  const { from_month, to_month, category_id } = query;
  const conditions = ['e.is_deleted = 0', "e.approval_status = 'Approved'"];
  const params = [];
  if (from_month) { conditions.push('e.month_year >= ?'); params.push(from_month); }
  if (to_month) { conditions.push('e.month_year <= ?'); params.push(to_month); }
  if (category_id) { conditions.push('e.category_id = ?'); params.push(category_id); }

  const rows = db.prepare(`
    SELECT e.*, ec.name as category_name
    FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY e.expense_date DESC
  `).all(...params);

  const byCategory = db.prepare(`
    SELECT ec.name, SUM(e.amount) as total, COUNT(*) as count
    FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY ec.name ORDER BY total DESC
  `).all(...params);

  return { rows, byCategory };
};

const getOccupancyReport = () => {
  return db.prepare(`
    SELECT b.name as block, a.floor,
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
      SUM(CASE WHEN a.status = 'Vacant' THEN 1 ELSE 0 END) as vacant
    FROM apartments a JOIN blocks b ON a.block_id = b.id
    WHERE a.is_deleted = 0
    GROUP BY b.name, a.floor ORDER BY b.name, a.floor
  `).all();
};

const getDefaulters = (query) => {
  const month = query.bill_month || new Date().toISOString().slice(0, 7);
  return db.prepare(`
    SELECT mb.*, a.flat_number, b.name as block_name,
      o.first_name as owner_first, o.last_name as owner_last, o.phone as owner_phone
    FROM maintenance_bills mb
    JOIN apartments a ON mb.apartment_id = a.id
    JOIN blocks b ON a.block_id = b.id
    LEFT JOIN apartment_owners ao ON ao.apartment_id = a.id AND ao.is_current = 1
    LEFT JOIN owners o ON ao.owner_id = o.id
    WHERE mb.bill_month = ? AND mb.payment_status IN ('Pending','Overdue') AND mb.is_deleted = 0
    ORDER BY b.name, a.flat_number
  `).all(month);
};

const exportPDF = async (type, query) => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', b => buffers.push(b));

  doc.fontSize(18).text('Apartment Management System', { align: 'center' });
  doc.fontSize(14).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();

  if (type === 'maintenance') {
    const { rows, summary } = getMaintenanceReport(query);
    doc.fontSize(12).text('Summary by Month:');
    summary.forEach(s => {
      doc.fontSize(9).text(`  ${s.bill_month}: Billed ₹${s.billed?.toFixed(2)} | Collected ₹${s.collected?.toFixed(2)} | Pending: ${s.pending_count}`);
    });
    doc.moveDown();
    doc.fontSize(12).text('Details:');
    rows.slice(0, 100).forEach(r => {
      doc.fontSize(8).text(`  ${r.block_name}-${r.flat_number} | ${r.bill_month} | ₹${r.total_amount} | ${r.payment_status}`);
    });
  } else if (type === 'expense') {
    const { rows, byCategory } = getExpenseReport(query);
    doc.fontSize(12).text('By Category:');
    byCategory.forEach(c => {
      doc.fontSize(9).text(`  ${c.name}: ₹${c.total?.toFixed(2)} (${c.count} entries)`);
    });
    doc.moveDown();
    doc.fontSize(12).text('Details:');
    rows.slice(0, 100).forEach(r => {
      doc.fontSize(8).text(`  ${r.expense_date} | ${r.category_name} | ${r.title} | ₹${r.amount}`);
    });
  }

  doc.end();
  return new Promise(resolve => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
};

const exportExcel = async (type, query) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Apartment Management System';

  if (type === 'maintenance') {
    const { rows, summary } = getMaintenanceReport(query);
    const sheet = workbook.addWorksheet('Maintenance Report');
    sheet.addRow(['Flat', 'Block', 'Month', 'Total', 'Paid', 'Status', 'Due Date', 'Payment Mode']);
    rows.forEach(r => sheet.addRow([r.flat_number, r.block_name, r.bill_month, r.total_amount, r.paid_amount, r.payment_status, r.due_date, r.payment_mode]));

    const sumSheet = workbook.addWorksheet('Summary');
    sumSheet.addRow(['Month', 'Billed', 'Collected', 'Paid Count', 'Pending Count']);
    summary.forEach(s => sumSheet.addRow([s.bill_month, s.billed, s.collected, s.paid_count, s.pending_count]));
  } else if (type === 'expense') {
    const { rows, byCategory } = getExpenseReport(query);
    const sheet = workbook.addWorksheet('Expenses');
    sheet.addRow(['Date', 'Category', 'Title', 'Amount', 'Vendor', 'Status', 'Month']);
    rows.forEach(r => sheet.addRow([r.expense_date, r.category_name, r.title, r.amount, r.vendor_name, r.approval_status, r.month_year]));

    const catSheet = workbook.addWorksheet('By Category');
    catSheet.addRow(['Category', 'Total', 'Count']);
    byCategory.forEach(c => catSheet.addRow([c.name, c.total, c.count]));
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
};

module.exports = { getMaintenanceReport, getExpenseReport, getOccupancyReport, getDefaulters, exportPDF, exportExcel };
