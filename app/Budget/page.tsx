'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react';

interface Budget {
  _id: string;
  month: string;
  category: string;
  amount: number;
}

interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  remaining: number;
  percentage: number;
}

interface BudgetInsights {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  overBudgetCategories: BudgetComparison[];
  underBudgetCategories: BudgetComparison[];
  unusedCategories: BudgetComparison[];
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Other'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [comparison, setComparison] = useState<BudgetComparison[]>([]);
  const [insights, setInsights] = useState<BudgetInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/budgets?month=${selectedMonth}`);
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, [selectedMonth]);

  const fetchComparison = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/budgets/comparison?month=${selectedMonth}`);
      const data = await response.json();
      setComparison(data.comparison);
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching comparison:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchBudgets();
    fetchComparison();
  }, [fetchBudgets, fetchComparison]);

  const handleSaveBudget = async () => {
    if (!newBudget.category || !newBudget.amount) return;

    try {
      const response = await fetch('/api/v1/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          category: newBudget.category,
          amount: parseFloat(newBudget.amount)
        })
      });

      if (response.ok) {
        setNewBudget({ category: '', amount: '' });
        fetchBudgets();
        fetchComparison();
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/budgets/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBudgets();
        fetchComparison();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleUpdateBudget = async (id: string, amount: number) => {
    try {
      const budget = budgets.find(b => b._id === id);
      if (!budget) return;

      const response = await fetch('/api/v1/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          category: budget.category,
          amount: amount
        })
      });

      if (response.ok) {
        setEditingBudget(null);
        fetchBudgets();
        fetchComparison();
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const chartData = comparison.map(item => ({
    name: item.category,
    Budget: item.budget,
    Actual: item.actual,
    Remaining: Math.max(0, item.remaining)
  }));

  const pieData = comparison
    .filter(item => item.actual > 0)
    .map(item => ({
      name: item.category,
      value: item.actual
    }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Set and track your monthly category budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="month">Month:</Label>
          <Input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget vs Actual Spending</CardTitle>
            <CardDescription>Compare your budgeted amounts with actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : comparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar dataKey="Budget" fill="#8884d8" />
                  <Bar dataKey="Actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No budget data available for this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>Actual spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No spending data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Total Budget</div>
              </div>
              <div className="text-2xl font-bold">${insights.totalBudget.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Total Spent</div>
              </div>
              <div className="text-2xl font-bold">${insights.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Remaining</div>
              </div>
              <div className="text-2xl font-bold">${insights.totalRemaining.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Usage</div>
              </div>
              <div className="text-2xl font-bold">{insights.overallPercentage}%</div>
              <Progress value={insights.overallPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set Monthly Budgets</CardTitle>
            <CardDescription>Add or update category budgets for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveBudget} disabled={!newBudget.category || !newBudget.amount}>
              Save Budget
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Budgets</CardTitle>
            <CardDescription>Manage your category budgets for {selectedMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No budgets set for this month
                </div>
              ) : (
                budgets.map((budget) => (
                  <div key={budget._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{budget.category}</div>
                      {editingBudget === budget._id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="number"
                            defaultValue={budget.amount}
                            className="w-24"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleUpdateBudget(budget._id, parseFloat(input.value));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector(`input[data-budget-id="${budget._id}"]`) as HTMLInputElement;
                              if (input) {
                                handleUpdateBudget(budget._id, parseFloat(input.value));
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBudget(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          ${budget.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingBudget !== budget._id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBudget(budget._id)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBudget(budget._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.overBudgetCategories.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Over Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.overBudgetCategories.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <Badge variant="destructive">
                        ${(item.actual - item.budget).toFixed(2)} over
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.underBudgetCategories.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="h-5 w-5" />
                  Under Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.underBudgetCategories.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <Badge variant="secondary" className="text-green-600">
                        ${item.remaining.toFixed(2)} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.unusedCategories.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Unused Budgets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.unusedCategories.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <Badge variant="outline" className="text-blue-600">
                        ${item.budget.toFixed(2)} available
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Budget;