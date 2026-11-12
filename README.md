# Expense Tracker API

A RESTful API for recording income and expenses, organizing transactions into categories, and viewing financial summaries. Built with Node.js, Express, MongoDB, and Mongoose.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Postman / Thunder Client (for API testing)

## Project Structure

```text
expense-tracker-api/
├── config/
│   └── db.js
├── controllers/
│   └── transactionController.js
├── models/
│   └── Transaction.js
├── routes/
│   └── transactionRoutes.js
├── middleware/
│   └── errorMiddleware.js
├── .env.example
├── .gitignore
├── server.js
├── package.json
└── README.md
```

## Installation and Setup

1. **Clone/open the project**
   ```bash
   cd expense-tracker-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and update values if needed:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   NODE_ENV=development
   ```

   > Make sure MongoDB is running locally, or replace `MONGO_URI` with your MongoDB Atlas connection string.

4. **Run the server**
   ```bash
   # Development (auto-reload with nodemon)
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:5000` (or your configured `PORT`).

## Transaction Model

| Field           | Type    | Requirements |
|-----------------|---------|--------------|
| `title`         | String  | Required |
| `description`   | String  | Optional |
| `amount`        | Number  | Required, must be > 0 |
| `type`          | String  | Required, `income` or `expense` |
| `category`      | String  | Required |
| `date`          | Date    | Required, defaults to current date |
| `paymentMethod` | String  | Optional |
| `timestamps`    | Auto    | Includes `createdAt` and `updatedAt` |

## API Endpoints

Base URL: `http://localhost:5000/api/transactions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/transactions` | Create a new transaction |
| `GET` | `/api/transactions` | Get all transactions (supports filters + pagination) |
| `GET` | `/api/transactions/:id` | Get a single transaction by ID |
| `PATCH` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/transactions/summary` | Get financial summary (aggregation) |
| `GET` | `/api/transactions/summary/categories` | Get expense totals by category (bonus, aggregation) |

### Query Parameters for `GET /api/transactions`

| Parameter | Example | Description |
|-----------|---------|-------------|
| `type` | `income` / `expense` | Filter by transaction type |
| `category` | `Food` | Filter by category |
| `startDate` | `2026-11-01` | Start of date range (inclusive) |
| `endDate` | `2026-11-30` | End of date range (inclusive) |
| `minAmount` | `5000` | Minimum amount filter |
| `maxAmount` | `50000` | Maximum amount filter |
| `page` | `1` | Page number (default: 1) |
| `limit` | `10` | Items per page (default: 10, max: 100) |

Filters can be combined, e.g.:
`GET /api/transactions?type=expense&category=Food&startDate=2026-11-01&endDate=2026-11-30`

## Example Requests & Responses

### 1) Create a Transaction

**Request**
```http
POST /api/transactions
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "description": "Bought food items for the week",
  "amount": 25000,
  "type": "expense",
  "category": "Food",
  "date": "2026-11-06",
  "paymentMethod": "Transfer"
}
```

**Response** (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Grocery Shopping",
    "description": "Bought food items for the week",
    "amount": 25000,
    "type": "expense",
    "category": "Food",
    "date": "2026-11-06T00:00:00.000Z",
    "paymentMethod": "Transfer",
    "createdAt": "2026-11-09T10:00:00.000Z",
    "updatedAt": "2026-11-09T10:00:00.000Z",
    "__v": 0
  }
}
```

### 2) Get All Transactions (with filters + pagination)

**Request**
```http
GET /api/transactions?type=expense&category=Food&page=1&limit=10
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  },
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "title": "Grocery Shopping",
      "amount": 25000,
      "type": "expense",
      "category": "Food",
      "date": "2026-11-06T00:00:00.000Z",
      "createdAt": "2026-11-09T10:00:00.000Z",
      "updatedAt": "2026-11-09T10:00:00.000Z"
    }
  ]
}
```

### 3) Get a Single Transaction

**Request**
```http
GET /api/transactions/664f1a2b3c4d5e6f7a8b9c0d
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Grocery Shopping",
    "amount": 25000,
    "type": "expense",
    "category": "Food"
  }
}
```

**Not Found** (`404`)
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

### 4) Update a Transaction

**Request**
```http
PATCH /api/transactions/664f1a2b3c4d5e6f7a8b9c0d
Content-Type: application/json

{
  "amount": 27000,
  "description": "Updated grocery amount"
}
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Grocery Shopping",
    "amount": 27000,
    "type": "expense",
    "category": "Food",
    "description": "Updated grocery amount"
  }
}
```

### 5) Delete a Transaction

**Request**
```http
DELETE /api/transactions/664f1a2b3c4d5e6f7a8b9c0d
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Grocery Shopping"
  }
}
```

### 6) Financial Summary (Aggregation)

**Request**
```http
GET /api/transactions/summary
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "summary": {
    "totalIncome": 500000,
    "totalExpenses": 180000,
    "balance": 320000,
    "incomeCount": 5,
    "expenseCount": 12
  }
}
```

> Calculated using MongoDB aggregation (`$group`, `$cond`, `$project`) — not by fetching all documents and computing in JavaScript.

### 7) Category Breakdown (Bonus, Aggregation)

**Request**
```http
GET /api/transactions/summary/categories
```

**Response** (`200 OK`)
```json
{
  "success": true,
  "categories": [
    { "category": "Food", "total": 75000 },
    { "category": "Transportation", "total": 30000 },
    { "category": "Entertainment", "total": 20000 }
  ]
}
```

## Error Responses

| Status | Meaning | Example |
|--------|---------|---------|
| `400` | Invalid request / validation error | Invalid ID format, amount <= 0, invalid type |
| `404` | Not found | Transaction not found, unknown route |
| `500` | Internal server error | Unexpected server error |

**Validation error example**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Title is required",
    "Amount must be greater than 0"
  ]
}
```

## Testing

Use Postman or Thunder Client to verify:

- [ ] Create a transaction
- [ ] Get all transactions
- [ ] Get a single transaction
- [ ] Update a transaction
- [ ] Delete a transaction
- [ ] Filter by type (`?type=income` / `?type=expense`)
- [ ] Filter by category (`?category=Food`)
- [ ] Date-range filtering (`?startDate=...&endDate=...`)
- [ ] Amount filtering (`?minAmount=...&maxAmount=...`)
- [ ] Combined filters
- [ ] Financial summary returns correct calculations

## Notes

- `.env` is ignored by git (`.gitignore`). Use `.env.example` as a template.
- The summary endpoint uses Mongoose `aggregate()` for calculations as required.
