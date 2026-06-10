const expenseRepo = require('../repositories/expense.repository');
const db = require('../config/database');

const listExpenses = (query) => expenseRepo.findAllWithCategory({
  page: +query.page || 1, limit: +query.limit || 20,
  category_id: +query.category_id || undefined,
  month_year: query.month_year,
  approval_status: query.approval_status,
  search: query.search,
});

const getExpense = (id) => { const e = expenseRepo.findById(id); if (!e) throw { status: 404, message: 'Expense not found' }; return e; };
const createExpense = (data, userId) => expenseRepo.create(data, userId);
const updateExpense = (id, data, userId) => { const e = expenseRepo.findById(id); if (!e) throw { status: 404, message: 'Expense not found' }; return expenseRepo.update(id, data, userId); };
const deleteExpense = (id, userId) => { const e = expenseRepo.findById(id); if (!e) throw { status: 404, message: 'Expense not found' }; return expenseRepo.softDelete(id, userId); };
const approveExpense = (id, status, userId) => expenseRepo.approve(id, userId, status);

const getCategories = () => db.prepare('SELECT * FROM expense_categories WHERE is_active = 1').all();
const getSummary = (query) => {
  if (query.month_year) return expenseRepo.getCategoryTotals(query.month_year);
  return expenseRepo.getMonthlySummary(query.year || new Date().getFullYear());
};

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense, approveExpense, getCategories, getSummary };
