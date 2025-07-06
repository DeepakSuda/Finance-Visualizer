"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Transaction, fetchTransactions } from "@/lib/api";

interface MonthlyExpenseData {
  month: string;
  totalAmount: number;
  transactionCount: number;
  netAmount: number;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<MonthlyExpenseData[]>([]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      processData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const processData = (data: Transaction[]) => {
    // Group transactions by month with separate income and expense tracking
    const monthlyMap = new Map<string, { income: number; expenses: number; transactionCount: number }>();

    data.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0, transactionCount: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;

      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }

      monthData.transactionCount += 1;
    });

    // Convert to array and calculate net amount (income - expenses)
    const monthlyArray: MonthlyExpenseData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      totalAmount: Math.abs(data.income - data.expenses), // Absolute value of net amount
      transactionCount: data.transactionCount,
      netAmount: data.income - data.expenses // Keep original net amount for tooltip
    }));

    // Sort by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyArray.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    setMonthlyExpenseData(monthlyArray);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: MonthlyExpenseData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.netAmount >= 0;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            Net Amount: {formatCurrency(data.netAmount)}
          </p>
          <p className="text-sm text-gray-600">
            Transactions: {data.transactionCount}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number) => {
    const colors = ['#ef4444', '#3b82f6', '#10b981']; // Red, Blue, Green
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={loadTransactions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Transactions</h1>
        <p className="text-gray-600">Track your transaction patterns by month</p>
      </div>



      {/* Monthly Transactions Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {monthlyExpenseData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transaction data available for charting</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalAmount"
                radius={[4, 4, 0, 0]}
              >
                {monthlyExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;