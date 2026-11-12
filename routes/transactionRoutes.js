import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategorySummary,
} from '../controllers/transactionController.js';

const router = Router();

// Summary routes must come before /:id
router.get('/summary/categories', getCategorySummary);
router.get('/summary', getSummary);

router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransactionById)
  .patch(updateTransaction)
  .delete(deleteTransaction);

export default router;
