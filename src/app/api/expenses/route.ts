import { NextResponse } from 'next/server';
import { sql, saveExpenseToNeon } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'tripId is required' }, { status: 400 });
    }

    const expenses = await sql`
      SELECT e.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', a.id,
                   'participantId', a.participant_id,
                   'amountOwed', a.amount_owed,
                   'notes', a.notes
                 )
               ) FILTER (WHERE a.id IS NOT NULL), '[]'
             ) as allocations
      FROM expenses e
      LEFT JOIN expense_allocations a ON e.id = a.expense_id
      WHERE e.trip_id = ${tripId}
      GROUP BY e.id
      ORDER BY e.created_at DESC;
    `;

    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { expense } = body;

    if (!expense || !expense.id || !expense.title || !expense.tripId) {
      return NextResponse.json({ success: false, error: 'Missing expense information' }, { status: 400 });
    }

    const saved = await saveExpenseToNeon(expense);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write expense to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, expenseId: expense.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
