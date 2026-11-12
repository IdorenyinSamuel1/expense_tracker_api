import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description, paymentMethod } = req.body;

    // Basic presence checks (schema also validates, but this gives clear 400s)
    if (!title || amount === undefined || amount === null || !type || !category) {
      res.status(400);
      return next(new Error('Please provide all required fields: title, amount, type, category'));
    }

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      res.status(400);
      return next(new Error('Amount must be a number greater than 0'));
    }

    const normalizedType = String(type).toLowerCase().trim();
    if (!['income', 'expense'].includes(normalizedType)) {
      res.status(400);
      return next(new Error('Type must be either income or expense'));
    }

    const transaction = await Transaction.create({
      title,
      description,
      amount,
      type: normalizedType,
      category,
      date: date || undefined,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions with filters and pagination
// @route   GET /api/transactions
// @access  Public
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (type) {
      const normalizedType = String(type).toLowerCase().trim();
      if (!['income', 'expense'].includes(normalizedType)) {
        res.status(400);
        return next(new Error('Type filter must be either income or expense'));
      }
      query.type = normalizedType;
    }

    if (category) {
      query.category = String(category).trim();
    }

    // Date range filter (inclusive)
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          res.status(400);
          return next(new Error('Invalid startDate format'));
        }
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          res.status(400);
          return next(new Error('Invalid endDate format'));
        }
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Amount filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) {
        const min = Number(minAmount);
        if (Number.isNaN(min)) {
          res.status(400);
          return next(new Error('minAmount must be a valid number'));
        }
        query.amount.$gte = min;
      }
      if (maxAmount !== undefined) {
        const max = Number(maxAmount);
        if (Number.isNaN(max)) {
          res.status(400);
          return next(new Error('maxAmount must be a valid number'));
        }
        query.amount.$lte = max;
      }
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single transaction by ID
// @route   GET /api/transactions/:id
// @access  Public
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      return next(new Error('Invalid transaction ID format'));
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found'));
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PATCH /api/transactions/:id
// @access  Public
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      return next(new Error('Invalid transaction ID format'));
    }

    // Validate fields if provided
    if (req.body.amount !== undefined) {
      const amount = Number(req.body.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        res.status(400);
        return next(new Error('Amount must be a number greater than 0'));
      }
      req.body.amount = amount;
    }

    if (req.body.type !== undefined) {
      const normalizedType = String(req.body.type).toLowerCase().trim();
      if (!['income', 'expense'].includes(normalizedType)) {
        res.status(400);
        return next(new Error('Type must be either income or expense'));
      }
      req.body.type = normalizedType;
    }

    if (req.body.date !== undefined) {
      const parsedDate = new Date(req.body.date);
      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400);
        return next(new Error('Invalid date format'));
      }
      req.body.date = parsedDate;
    }

    const transaction = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found'));
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      return next(new Error('Invalid transaction ID format'));
    }

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial summary (uses aggregation)
// @route   GET /api/transactions/summary
// @access  Public
const getSummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, 1, 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          balance: { $subtract: ['$totalIncome', '$totalExpenses'] },
          incomeCount: 1,
          expenseCount: 1,
        },
      },
    ]);

    const summary = result[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
    };

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown for expenses (bonus, uses aggregation)
// @route   GET /api/transactions/summary/categories
// @access  Public
const getCategorySummary = async (req, res, next) => {
  try {
    const categories = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategorySummary,
};
