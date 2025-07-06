import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        let query = {};
        if (month) {
            query = { month };
        }

        const budgets = await Budget.find(query).sort({ category: 1 });
        return NextResponse.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch budgets' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const { month, category, amount } = body;

        if (!month || !category || amount === undefined) {
            return NextResponse.json(
                { error: 'Month, category, and amount are required' },
                { status: 400 }
            );
        }

        const existingBudget = await Budget.findOne({ month, category });

        if (existingBudget) {
            existingBudget.amount = amount;
            await existingBudget.save();
            return NextResponse.json(existingBudget);
        } else {
            const newBudget = new Budget({ month, category, amount });
            await newBudget.save();
            return NextResponse.json(newBudget, { status: 201 });
        }
    } catch (error) {
        console.error('Error creating/updating budget:', error);
        return NextResponse.json(
            { error: 'Failed to create/update budget' },
            { status: 500 }
        );
    }
} 