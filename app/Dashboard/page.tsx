"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Transaction, fetchTransactions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, FileText } from "lucide-react";

interface CategorySummary {
  name: string;
  total: number;
  count: number;
  percentage: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const loadTransactions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const processData = (data: Transaction[]) => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<string, { total: number; count: number }>();

    data.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }

      const category = transaction.category || 'Other';
      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      categoryMap.set(category, {
        total: existing.total + transaction.amount,
        count: existing.count + 1
      });
    });

    const netAmount = totalIncome - totalExpenses;
    const totalAmount = totalIncome + totalExpenses;

    setSummary({
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: data.length
    });

    const categoryArray: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setCategoryBreakdown(categoryArray);

    const recent = data
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setRecentTransactions(recent);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food & dining':
        return <ShoppingCart className="h-4 w-4" />;
      case 'transportation':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All time income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Income minus expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.transactionCount}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(category.name)}
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.total)}</div>
                      <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(transaction.category)}
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.category} • {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;