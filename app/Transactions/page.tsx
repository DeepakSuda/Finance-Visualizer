"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, FileText, CreditCard, ShoppingCart } from "lucide-react";
import { Transaction, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmountInput, setEditAmountInput] = useState('');
  const [editAmountError, setEditAmountError] = useState('');
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: '',
    paymentMethod: '',
    type: 'expense'
  });
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Income',
    'Other'
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Check'
  ];

  const handleAddTransaction = async () => {
    const amount = parseFloat(amountInput);

    // Clear previous errors
    setAmountError('');

    // Validate amount
    if (!amountInput.trim()) {
      setAmountError('Amount is required');
      return;
    }

    if (amount <= 0) {
      setAmountError('Amount must be greater than zero');
      return;
    }

    if (newTransaction.description && amount > 0) {
      try {
        const transactionData = {
          ...newTransaction,
          amount: amount
        };
        const createdTransaction = await createTransaction(transactionData);
        setTransactions([createdTransaction, ...transactions]);
        setNewTransaction({
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: 0,
          category: '',
          paymentMethod: '',
          type: 'expense'
        });
        setAmountInput('');
        setAmountError('');
        setIsAddDialogOpen(false);
      } catch (err) {
        console.error('Error creating transaction:', err);
        setError('Failed to create transaction');
      }
    }
  };

  const handleEditTransaction = async () => {
    const amount = parseFloat(editAmountInput);

    // Clear previous errors
    setEditAmountError('');

    // Validate amount
    if (!editAmountInput.trim()) {
      setEditAmountError('Amount is required');
      return;
    }

    if (amount <= 0) {
      setEditAmountError('Amount must be greater than zero');
      return;
    }

    if (editingTransaction && editingTransaction.description && amount > 0 && editingTransaction._id) {
      try {
        const updatedTransaction = await updateTransaction(editingTransaction._id, {
          date: editingTransaction.date,
          description: editingTransaction.description,
          amount: amount,
          category: editingTransaction.category,
          paymentMethod: editingTransaction.paymentMethod,
          type: editingTransaction.type
        });
        setTransactions(transactions.map(t =>
          t._id === editingTransaction._id ? updatedTransaction : t
        ));
        setEditingTransaction(null);
        setEditAmountInput('');
        setEditAmountError('');
        setIsEditDialogOpen(false);
      } catch (err) {
        console.error('Error updating transaction:', err);
        setError('Failed to update transaction');
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
    setEditAmountInput(transaction.amount.toString());
    setEditAmountError('');
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food & dining':
        return <ShoppingCart className="h-4 w-4" />;
      case 'transportation':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') =>
                    setNewTransaction({ ...newTransaction, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter transaction description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError(''); // Clear error when user types
                  }}
                  className={amountError ? 'border-red-500' : ''}
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-1">{amountError}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newTransaction.category} onValueChange={(value) =>
                    setNewTransaction({ ...newTransaction, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={newTransaction.paymentMethod} onValueChange={(value) =>
                    setNewTransaction({ ...newTransaction, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={handleAddTransaction} className="cursor-pointer">
                  Add Transaction
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow">
        {loading && <div className="text-center py-8">Loading transactions...</div>}
        {error && <div className="text-center py-8 text-red-600">{error}</div>}
        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No transactions found. Add your first transaction!</div>
        )}
        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(transaction.category)}
                        {transaction.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(transaction)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction._id!)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={editingTransaction.type} onValueChange={(value: 'income' | 'expense') =>
                    setEditingTransaction({ ...editingTransaction, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter transaction description"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={editAmountInput}
                  onChange={(e) => {
                    setEditAmountInput(e.target.value);
                    setEditAmountError(''); // Clear error when user types
                  }}
                  className={editAmountError ? 'border-red-500' : ''}
                />
                {editAmountError && (
                  <p className="text-red-500 text-sm mt-1">{editAmountError}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={editingTransaction.category} onValueChange={(value) =>
                    setEditingTransaction({ ...editingTransaction, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={editingTransaction.paymentMethod} onValueChange={(value) =>
                    setEditingTransaction({ ...editingTransaction, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button onClick={handleEditTransaction} className="cursor-pointer">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Transactions;