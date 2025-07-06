import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

// GET /api/transactions/[id] - Get single transaction
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const transaction = await Transaction.findById(id).lean();

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 }
        );
    }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await request.json();

        // Validate required fields
        if (!body.description || !body.amount || !body.category || !body.paymentMethod || !body.type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            {
                date: body.date,
                description: body.description,
                amount: body.amount,
                category: body.category,
                paymentMethod: body.paymentMethod,
                type: body.type
            },
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to update transaction' },
            { status: 500 }
        );
    }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json(
            { error: 'Failed to delete transaction' },
            { status: 500 }
        );
    }
} 