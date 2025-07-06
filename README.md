# Finance Visualizer

> **Note:** This is an assignment project for Stage One.

Finance Visualizer is a modern web app to help you track your income and expenses, analyze your spending, and visualize your financial health. Built with Next.js, TypeScript, MongoDB, and Tailwind CSS, it's designed to be fast, intuitive, and easy to use.

## Features

- Add, edit, and delete transactions
- Categorize your spending and income
- See monthly net amounts (income minus expenses) in a beautiful bar chart
- Data is stored in MongoDB for persistence

## Getting Started

### Prerequisites
- Node.js 18 or newer
- MongoDB (local or Atlas)

### Setup

1. **Clone this repo:**
   ```bash
   git clone https://github.com/yourusername/finance-visualizer.git
   cd finance-visualizer
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure your database:**
   - Create a `.env.local` file in the root folder:
     ```env
     MONGODB_URI=mongodb://localhost:27017/finance-visualizer
     # Or use your MongoDB Atlas connection string
     ```
4. **Start the app:**
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
finance-visualizer/
├── app/            # Pages and API routes
├── components/     # UI components
├── lib/            # Database and utility code
├── public/         # Static files
└── ...
```

## API Endpoints

- `GET /api/v1/transactions` — List all transactions
- `POST /api/v1/transactions` — Add a new transaction
- `PUT /api/v1/transactions/[id]` — Update a transaction
- `DELETE /api/v1/transactions/[id]` — Delete a transaction

## Contributing

If you find a bug or have a feature idea, feel free to open an issue or submit a pull request. All contributions are welcome!

Thanks for checking out Finance Visualizer! If you have any questions or feedback, please reach out or open an issue.
