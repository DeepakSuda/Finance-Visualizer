import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import Transaction from '@/lib/models/Transaction';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json(
                { error: 'Month parameter is required' },
                { status: 400 }
            );
        }

        const [year, monthNum] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

        const budgets = await Budget.find({ month }).sort({ category: 1 });
        const transactions = await Transaction.find({
            date: { $gte: startDate, $lte: endDate },
            type: 'expense'
        });

        const categorySpending = transactions.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += transaction.amount;
            return acc;
        }, {} as Record<string, number>);

        const comparison = budgets.map(budget => ({
            category: budget.category,
            budget: budget.amount,
            actual: categorySpending[budget.category] || 0,
            remaining: budget.amount - (categorySpending[budget.category] || 0),
            percentage: categorySpending[budget.category]
                ? Math.round((categorySpending[budget.category] / budget.amount) * 100)
                : 0
        }));

        const totalBudget = budgets.reduce((sum: number, budget) => sum + budget.amount, 0);
        const spendingValues = Object.values(categorySpending) as number[];
        const totalSpent = spendingValues.reduce((sum: number, amount: number) => sum + amount, 0);

        const insights = {
            totalBudget,
            totalSpent,
            totalRemaining: totalBudget - totalSpent,
            overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
            overBudgetCategories: comparison.filter(item => item.actual > item.budget),
            underBudgetCategories: comparison.filter(item => item.actual < item.budget && item.actual > 0),
            unusedCategories: comparison.filter(item => item.actual === 0)
        };

        return NextResponse.json({
            comparison,
            insights
        });
    } catch (error) {
        console.error('Error fetching budget comparison:', error);
        return NextResponse.json(
            { error: 'Failed to fetch budget comparison' },
            { status: 500 }
        );
    }
} 