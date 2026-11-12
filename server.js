import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Expense Tracker API is running' });
});

app.use('/api/transactions', transactionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
