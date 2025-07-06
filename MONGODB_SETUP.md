# MongoDB Setup for Finance Visualizer

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB Community Server: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

2. **Environment Variables**
   Create a `.env.local` file in the root directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/finance-visualizer
   ```

## Setup Instructions

### Option 1: Local MongoDB

1. **Install MongoDB Community Server**
   - Download and install from MongoDB website
   - Start MongoDB service

2. **Create Database**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Create and use database
   use finance-visualizer
   
   # Exit shell
   exit
   ```

3. **Environment Configuration**
   ```bash
   # Create .env.local file
   echo "MONGODB_URI=mongodb://localhost:27017/finance-visualizer" > .env.local
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Create free account and cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Environment Configuration**
   ```bash
   # Create .env.local file with your Atlas connection string
   echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-visualizer" > .env.local
   ```

## Running the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open http://localhost:3000
   - Navigate to Transactions page
   - Start adding transactions!

## Database Schema

The application uses the following MongoDB collections:

### Transactions Collection
```javascript
{
  _id: ObjectId,
  date: Date,
  description: String,
  amount: Number,
  category: String,
  paymentMethod: String,
  type: String, // 'income' or 'expense'
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

- `GET /api/v1/transactions` - Fetch all transactions
- `POST /api/v1/transactions` - Create new transaction
- `GET /api/v1/transactions/[id]` - Get single transaction
- `PUT /api/v1/transactions/[id]` - Update transaction
- `DELETE /api/v1/transactions/[id]` - Delete transaction

## Troubleshooting

1. **Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`
   - Verify network access (for Atlas)

2. **Database Not Found**
   - MongoDB will create the database automatically
   - No manual database creation needed

3. **Permission Issues**
   - Ensure MongoDB user has read/write permissions
   - For Atlas, check IP whitelist settings 