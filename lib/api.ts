export interface Transaction {
    _id?: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    paymentMethod: string;
    type: 'income' | 'expense';
    createdAt?: string;
    updatedAt?: string;
}

// Fetch all transactions
export async function fetchTransactions(): Promise<Transaction[]> {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }
    return response.json();
}

// Create new transaction
export async function createTransaction(transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    });

    if (!response.ok) {
        throw new Error('Failed to create transaction');
    }

    return response.json();
}

// Update transaction
export async function updateTransaction(id: string, transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    });

    if (!response.ok) {
        throw new Error('Failed to update transaction');
    }

    return response.json();
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete transaction');
    }
} 