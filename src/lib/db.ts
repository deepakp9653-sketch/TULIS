// Neon PostgreSQL DB Client for FareShare
import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Xhx1ykgHS0cT@ep-tiny-mouse-a52mp86j-pooler.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

export const sql = neon(connectionString);

export async function fetchEventLog(tripId: string) {
  try {
    const rows = await sql`
      SELECT id, trip_id as "tripId", event_type as "eventType", actor_id as "actorId",
             payload_json as payload, sequence_num as "sequenceNum", created_at as "timestamp"
      FROM events
      WHERE trip_id = ${tripId}
      ORDER BY sequence_num ASC;
    `;
    return rows;
  } catch (error) {
    console.warn('Neon DB query fallback to memory cache:', error);
    return null;
  }
}

export async function logEventToNeon(tripId: string, eventType: string, actorId: string, payload: any) {
  try {
    await sql`
      INSERT INTO events (id, trip_id, event_type, actor_id, payload_json)
      VALUES (${'evt-' + Date.now()}, ${tripId}, ${eventType}, ${actorId}, ${JSON.stringify(payload)});
    `;
    return true;
  } catch (error) {
    console.warn('Neon DB insert event error:', error);
    return false;
  }
}

export async function saveTripToNeon(trip: any, participants: any[]) {
  try {
    // 1. Insert Trip
    await sql`
      INSERT INTO trips (id, title, destination, base_currency, start_date, end_date, budget_ceiling, invite_code, organizer_id)
      VALUES (
        ${trip.id},
        ${trip.title},
        ${trip.destination},
        ${trip.baseCurrency || 'INR'},
        ${trip.startDate || null},
        ${trip.endDate || null},
        ${trip.budgetCeiling || 0},
        ${trip.inviteCode || null},
        ${trip.organizerId || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        destination = EXCLUDED.destination,
        budget_ceiling = EXCLUDED.budget_ceiling,
        invite_code = EXCLUDED.invite_code;
    `;

    // 2. Insert Participants
    for (const p of participants) {
      await sql`
        INSERT INTO participants (id, trip_id, name, email, avatar_url, is_organizer, status, upi_id, weight, room_tier)
        VALUES (
          ${p.id},
          ${trip.id},
          ${p.name},
          ${p.email},
          ${p.avatarUrl || null},
          ${p.isOrganizer || false},
          ${p.status || 'active'},
          ${p.upiId || null},
          ${p.weight || 1},
          ${p.roomTier || 'standard'}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          avatar_url = EXCLUDED.avatar_url,
          upi_id = EXCLUDED.upi_id;
      `;
    }

    return true;
  } catch (error) {
    console.error('Neon DB save trip error:', error);
    return false;
  }
}

export async function saveExpenseToNeon(expense: any) {
  try {
    // 1. Insert Expense
    const expenseDate = expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString();
    await sql`
      INSERT INTO expenses (
        id, trip_id, booking_id, title, total_amount, currency, split_method,
        paid_by_id, category, receipt_url, receipt_name, subsidy_amount, paid_by_splits, created_at
      )
      VALUES (
        ${expense.id},
        ${expense.tripId},
        ${expense.bookingId || null},
        ${expense.title},
        ${expense.totalAmount},
        ${expense.currency || 'INR'},
        ${expense.splitMethod},
        ${expense.paidById},
        ${expense.category || 'general'},
        ${expense.receiptUrl || null},
        ${expense.receiptName || null},
        ${expense.subsidyAmount || 0},
        ${expense.paidBySplits ? JSON.stringify(expense.paidBySplits) : null},
        ${expenseDate}
      )
      ON CONFLICT (id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        split_method = EXCLUDED.split_method,
        created_at = EXCLUDED.created_at;
    `;

    // 2. Insert Allocations
    if (expense.allocations && expense.allocations.length > 0) {
      for (const alloc of expense.allocations) {
        const allocId = alloc.id || `alloc-${expense.id}-${alloc.participantId}`;
        await sql`
          INSERT INTO expense_allocations (id, expense_id, participant_id, amount_owed, notes)
          VALUES (
            ${allocId},
            ${expense.id},
            ${alloc.participantId},
            ${alloc.amountOwed},
            ${alloc.notes || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            amount_owed = EXCLUDED.amount_owed;
        `;
      }
    }

    return true;
  } catch (error) {
    console.error('Neon DB save expense error:', error);
    return false;
  }
}

export async function saveBookingToNeon(booking: any) {
  try {
    await sql`
      INSERT INTO bookings (
        id, trip_id, category, title, vendor, start_time, end_time, estimated_cost, actual_cost, status
      )
      VALUES (
        ${booking.id},
        ${booking.tripId},
        ${booking.category},
        ${booking.title},
        ${booking.vendor || null},
        ${booking.startTime || null},
        ${booking.endTime || null},
        ${booking.estimatedCost || 0},
        ${booking.actualCost || 0},
        ${booking.status || 'confirmed'}
      )
      ON CONFLICT (id) DO UPDATE SET
        actual_cost = EXCLUDED.actual_cost,
        status = EXCLUDED.status;
    `;
    return true;
  } catch (error) {
    console.error('Neon DB save booking error:', error);
    return false;
  }
}

export async function saveRefundToNeon(refund: any) {
  try {
    await sql`
      INSERT INTO refunds (id, trip_id, booking_id, expense_id, amount, currency, refunded_to_payer_id, policy, reason)
      VALUES (${refund.id}, ${refund.tripId}, ${refund.bookingId || null}, ${refund.expenseId || null}, ${refund.amount}, ${refund.currency || 'INR'}, ${refund.refundedToPayerId}, ${refund.policy}, ${refund.reason || null});
    `;
    return true;
  } catch (error) {
    console.warn('Neon DB save refund error:', error);
    return false;
  }
}

export async function updateBookingInNeon(
  bookingId: string,
  status: string,
  refundPolicy?: string,
  cancellationReason?: string,
  refundAmount?: number
) {
  try {
    await sql`
      UPDATE bookings 
      SET status = ${status}
      WHERE id = ${bookingId};
    `;
    return true;
  } catch (error) {
    console.warn('Neon DB update booking error:', error);
    return false;
  }
}

export async function fetchTripExpensesWithAllocations(tripId: string) {
  try {
    const rawExpenses = await sql`SELECT * FROM expenses WHERE trip_id = ${tripId} ORDER BY created_at DESC;`;
    if (!rawExpenses || rawExpenses.length === 0) return [];

    const expenseIds = rawExpenses.map((e: any) => e.id);
    let allAllocations: any[] = [];
    try {
      allAllocations = await sql`
        SELECT * FROM expense_allocations 
        WHERE expense_id = ANY(${expenseIds});
      `;
    } catch (allocErr) {
      console.warn('Could not query expense_allocations:', allocErr);
    }

    return rawExpenses.map((e: any) => {
      const matchedAllocs = (allAllocations || [])
        .filter((a: any) => a.expense_id === e.id)
        .map((a: any) => ({
          id: a.id,
          expenseId: a.expense_id,
          participantId: a.participant_id,
          amountOwed: Number(a.amount_owed || 0),
          notes: a.notes || undefined,
        }));

      return {
        id: e.id,
        tripId: e.trip_id,
        bookingId: e.booking_id || undefined,
        title: e.title,
        totalAmount: Number(e.total_amount || 0),
        currency: e.currency || 'INR',
        splitMethod: e.split_method || 'equal',
        paidById: e.paid_by_id,
        category: e.category || 'general',
        receiptUrl: e.receipt_url || undefined,
        receiptName: e.receipt_name || undefined,
        subsidyAmount: Number(e.subsidy_amount || 0),
        paidBySplits: e.paid_by_splits || undefined,
        createdAt: e.created_at,
        allocations: matchedAllocs,
      };
    });
  } catch (err) {
    console.error('fetchTripExpensesWithAllocations error:', err);
    return [];
  }
}

export async function findTripByInviteCodeInNeon(inviteCode: string) {
  try {
    const cleanCode = inviteCode.trim().toUpperCase();
    const rows = await sql`
      SELECT * FROM trips 
      WHERE UPPER(invite_code) = ${cleanCode} 
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    const trip = rows[0];
    const participants = await sql`SELECT * FROM participants WHERE trip_id = ${trip.id};`;
    const bookings = await sql`SELECT * FROM bookings WHERE trip_id = ${trip.id};`;
    const expenses = await fetchTripExpensesWithAllocations(trip.id);
    const events = await sql`SELECT * FROM events WHERE trip_id = ${trip.id} ORDER BY sequence_num ASC;`;
    let payments: any[] = [];
    try {
      payments = await sql`SELECT * FROM payments WHERE trip_id = ${trip.id} ORDER BY created_at ASC;`;
    } catch {
      payments = [];
    }
    return { trip, participants, bookings, expenses, events, payments };
  } catch (error) {
    console.error('Neon DB findTripByInviteCode error:', error);
    return null;
  }
}

export async function addParticipantToTripInNeon(tripId: string, participant: any) {
  try {
    await sql`
      INSERT INTO participants (id, trip_id, name, email, avatar_url, is_organizer, status, upi_id, weight, room_tier)
      VALUES (
        ${participant.id},
        ${tripId},
        ${participant.name},
        ${participant.email},
        ${participant.avatarUrl || null},
        ${participant.isOrganizer || false},
        ${participant.status || 'active'},
        ${participant.upiId || null},
        ${participant.weight || 1},
        ${participant.roomTier || 'standard'}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url,
        upi_id = EXCLUDED.upi_id;
    `;
    return true;
  } catch (error) {
    console.error('Neon DB addParticipantToTrip error:', error);
    return false;
  }
}
