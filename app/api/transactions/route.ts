import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

// GET /api/transactions - Fetch all transactions
export async function GET() {
    try {
        await connectDB();

        const transactions = await Transaction.find({})
            .sort({ date: -1 })
            .lean();

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        if (!body.description || !body.amount || !body.category || !body.paymentMethod || !body.type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create new transaction
        const transaction = new Transaction({
            date: body.date || new Date(),
            description: body.description,
            amount: body.amount,
            category: body.category,
            paymentMethod: body.paymentMethod,
            type: body.type
        });

        const savedTransaction = await transaction.save();

        return NextResponse.json(savedTransaction, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
} 