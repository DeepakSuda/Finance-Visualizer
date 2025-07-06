import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
        format: 'YYYY-MM'
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
            'Other'
        ]
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

budgetSchema.index({ month: 1, category: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

export default Budget; 