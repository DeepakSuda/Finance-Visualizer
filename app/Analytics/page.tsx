"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Transaction, fetchTransactions } from "@/lib/api";

interface MonthlyExpenseData {
  month: string;
  totalAmount: number;
  transactionCount: number;
  netAmount: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<MonthlyExpenseData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

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


  useEffect(() => {
    loadTransactions();
  }, []);

  const processData = (data: Transaction[]) => {
    const monthlyMap = new Map<string, { income: number; expenses: number; transactionCount: number }>();

    const categoryMap = new Map<string, number>();

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


      const category = transaction.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + transaction.amount);
    });


    const monthlyArray: MonthlyExpenseData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      totalAmount: Math.abs(data.income - data.expenses),
      transactionCount: data.transactionCount,
      netAmount: data.income - data.expenses
    }));


    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyArray.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));


    const totalAmount = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    const categoryArray: CategoryData[] = Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      name: category,
      value: amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: colors[index % colors.length]
    }));


    categoryArray.sort((a, b) => b.value - a.value);

    setMonthlyExpenseData(monthlyArray);
    setCategoryData(categoryArray);
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

  const PieChartTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: CategoryData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm font-medium text-blue-600">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number) => {
    const colors = ['#ef4444', '#3b82f6', '#10b981'];
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your transaction patterns and spending by category</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Transactions</h2>
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


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {categoryData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No category data available for charting</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


    </div>
  );
};

export default Analytics;