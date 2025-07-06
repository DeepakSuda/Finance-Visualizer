import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Healthcare',
            'Utilities',
            'Income',
            'Other'
        ]
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: [
            'Cash',
            'Credit Card',
            'Debit Card',
            'Bank Transfer',
            'Digital Wallet',
            'Check'
        ]
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction; 