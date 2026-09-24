import { NextResponse } from 'next/server';
import { sql, saveTripToNeon, findTripByInviteCodeInNeon, fetchTripExpensesWithAllocations } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inviteCode = searchParams.get('inviteCode');
    const tripId = searchParams.get('tripId');

    // 1. Lookup by Invite Code
    if (inviteCode) {
      const data = await findTripByInviteCodeInNeon(inviteCode);
      if (!data) {
        return NextResponse.json({ success: false, error: 'Trip not found with this invite code' }, { status: 404 });
      }

      const formattedTrip = {
        id: data.trip.id,
        title: data.trip.title,
        destination: data.trip.destination,
        baseCurrency: data.trip.base_currency || 'INR',
        startDate: data.trip.start_date,
        endDate: data.trip.end_date,
        budgetCeiling: Number(data.trip.budget_ceiling || 0),
        inviteCode: data.trip.invite_code,
        organizerId: data.trip.organizer_id,
        createdAt: data.trip.created_at,
      };

      const formattedParticipants = data.participants.map((p: any) => ({
        id: p.id,
        tripId: p.trip_id,
        name: p.name,
        email: p.email,
        avatarUrl: p.avatar_url || '',
        isOrganizer: Boolean(p.is_organizer),
        status: p.status || 'active',
        upiId: p.upi_id || `${p.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        weight: Number(p.weight || 1),
        roomTier: p.room_tier || 'standard',
      }));

      const formattedBookings = data.bookings.map((b: any) => ({
        id: b.id,
        tripId: b.trip_id,
        category: b.category,
        title: b.title,
        vendor: b.vendor || '',
        startTime: b.start_time,
        endTime: b.end_time,
        estimatedCost: Number(b.estimated_cost || 0),
        actualCost: Number(b.actual_cost || 0),
        status: b.status || 'confirmed',
        participantIds: b.participantIds || formattedParticipants.map((p: any) => p.id),
      }));

      const formattedExpenses = (data.expenses || []).map((e: any) => {
        let expAllocs = Array.isArray(e.allocations) ? e.allocations : [];

        // Synthesize valid allocations if none existed in DB
        if (expAllocs.length === 0 && formattedParticipants.length > 0) {
          const totalAmount = Number(e.totalAmount ?? e.total_amount ?? 0);
          const subsidyAmount = Number(e.subsidyAmount ?? e.subsidy_amount ?? 0);
          const net = Math.max(0, totalAmount - subsidyAmount);
          const activeParts = formattedParticipants.filter((p: any) => p.status === 'active');
          const targetParts = activeParts.length > 0 ? activeParts : formattedParticipants;
          const perPerson = Number((net / targetParts.length).toFixed(2));
          let running = 0;
          expAllocs = targetParts.map((p: any, idx: number) => {
            let owed = perPerson;
            if (idx === targetParts.length - 1) {
              owed = Number((net - running).toFixed(2));
            } else {
              running += owed;
            }
            return {
              id: `alloc-${e.id}-${p.id}`,
              expenseId: e.id,
              participantId: p.id,
              amountOwed: owed,
            };
          });
        }

        return {
          id: e.id,
          tripId: e.tripId || e.trip_id,
          bookingId: e.bookingId || e.booking_id || undefined,
          title: e.title,
          totalAmount: Number(e.totalAmount ?? e.total_amount ?? 0),
          currency: e.currency || 'INR',
          splitMethod: e.splitMethod || e.split_method || 'equal',
          paidById: e.paidById || e.paid_by_id,
          category: e.category || 'general',
          receiptUrl: e.receiptUrl || e.receipt_url || undefined,
          receiptName: e.receiptName || e.receipt_name || undefined,
          subsidyAmount: Number(e.subsidyAmount ?? e.subsidy_amount ?? 0),
          paidBySplits: e.paidBySplits || e.paid_by_splits || undefined,
          createdAt: e.createdAt || e.created_at,
          allocations: expAllocs,
        };
      });

      const formattedEvents = (data.events || []).map((e: any) => {
        const actor = formattedParticipants.find((p: any) => p.id === (e.actorId || e.actor_id));
        const payload = e.payload || e.payload_json || {};
        const eventType = e.eventType || e.event_type || 'LEDGER_EVENT';
        const description = e.description || payload.description || payload.reason || `${eventType.replace(/_/g, ' ')} recorded`;
        return {
          id: e.id,
          tripId: e.tripId || e.trip_id,
          eventType,
          actorId: e.actorId || e.actor_id || 'system',
          actorName: e.actorName || actor?.name || 'Traveler',
          timestamp: e.timestamp || e.created_at || new Date().toISOString(),
          description,
          payload,
          sequenceNum: Number(e.sequenceNum ?? e.sequence_num ?? 1),
        };
      });

      const formattedPayments = (data.payments || []).map((p: any) => ({
        id: p.id,
        tripId: p.trip_id || p.tripId,
        payerId: p.payer_id || p.payerId,
        payeeId: p.payee_id || p.payeeId,
        amount: Number(p.amount || 0),
        note: p.note || undefined,
        createdAt: p.created_at || p.createdAt,
      }));

      return NextResponse.json({
        success: true,
        trip: formattedTrip,
        participants: formattedParticipants,
        bookings: formattedBookings,
        expenses: formattedExpenses,
        payments: formattedPayments,
        events: formattedEvents,
      });
    }

    // 2. Lookup by Trip ID
    if (tripId) {
      const trips = await sql`SELECT * FROM trips WHERE id = ${tripId} LIMIT 1;`;
      if (trips.length === 0) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }
      const rawTrip = trips[0];
      const participants = await sql`SELECT * FROM participants WHERE trip_id = ${tripId};`;
      const bookings = await sql`SELECT * FROM bookings WHERE trip_id = ${tripId};`;
      const expenses = await fetchTripExpensesWithAllocations(tripId);
      const rawEvents = await sql`SELECT * FROM events WHERE trip_id = ${tripId} ORDER BY sequence_num ASC;`;
      let rawPayments: any[] = [];
      try {
        rawPayments = await sql`SELECT * FROM payments WHERE trip_id = ${tripId} ORDER BY created_at ASC;`;
      } catch {
        rawPayments = [];
      }

      const formattedTrip = {
        id: rawTrip.id,
        title: rawTrip.title,
        destination: rawTrip.destination,
        baseCurrency: rawTrip.base_currency || 'INR',
        startDate: rawTrip.start_date,
        endDate: rawTrip.end_date,
        budgetCeiling: Number(rawTrip.budget_ceiling || 0),
        inviteCode: rawTrip.invite_code,
        organizerId: rawTrip.organizer_id,
        createdAt: rawTrip.created_at,
      };

      const formattedParticipants = participants.map((p: any) => ({
        id: p.id,
        tripId: p.trip_id,
        name: p.name,
        email: p.email,
        avatarUrl: p.avatar_url || '',
        isOrganizer: Boolean(p.is_organizer),
        status: p.status || 'active',
        upiId: p.upi_id || `${p.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        weight: Number(p.weight || 1),
        roomTier: p.room_tier || 'standard',
      }));

      const formattedBookings = bookings.map((b: any) => ({
        id: b.id,
        tripId: b.trip_id,
        category: b.category,
        title: b.title,
        vendor: b.vendor || '',
        startTime: b.start_time,
        endTime: b.end_time,
        estimatedCost: Number(b.estimated_cost || 0),
        actualCost: Number(b.actual_cost || 0),
        status: b.status || 'confirmed',
        participantIds: b.participantIds || formattedParticipants.map((p: any) => p.id),
      }));

      const formattedExpenses = (expenses || []).map((e: any) => {
        let expAllocs = Array.isArray(e.allocations) ? e.allocations : [];

        if (expAllocs.length === 0 && formattedParticipants.length > 0) {
          const totalAmount = Number(e.totalAmount ?? e.total_amount ?? 0);
          const subsidyAmount = Number(e.subsidyAmount ?? e.subsidy_amount ?? 0);
          const net = Math.max(0, totalAmount - subsidyAmount);
          const activeParts = formattedParticipants.filter((p: any) => p.status === 'active');
          const targetParts = activeParts.length > 0 ? activeParts : formattedParticipants;
          const perPerson = Number((net / targetParts.length).toFixed(2));
          let running = 0;
          expAllocs = targetParts.map((p: any, idx: number) => {
            let owed = perPerson;
            if (idx === targetParts.length - 1) {
              owed = Number((net - running).toFixed(2));
            } else {
              running += owed;
            }
            return {
              id: `alloc-${e.id}-${p.id}`,
              expenseId: e.id,
              participantId: p.id,
              amountOwed: owed,
            };
          });
        }

        return {
          id: e.id,
          tripId: e.tripId || e.trip_id,
          bookingId: e.bookingId || e.booking_id || undefined,
          title: e.title,
          totalAmount: Number(e.totalAmount ?? e.total_amount ?? 0),
          currency: e.currency || 'INR',
          splitMethod: e.splitMethod || e.split_method || 'equal',
          paidById: e.paidById || e.paid_by_id,
          category: e.category || 'general',
          receiptUrl: e.receiptUrl || e.receipt_url || undefined,
          receiptName: e.receiptName || e.receipt_name || undefined,
          subsidyAmount: Number(e.subsidyAmount ?? e.subsidy_amount ?? 0),
          paidBySplits: e.paidBySplits || e.paid_by_splits || undefined,
          createdAt: e.createdAt || e.created_at,
          allocations: expAllocs,
        };
      });

      const formattedEvents = (rawEvents || []).map((e: any) => {
        const actor = formattedParticipants.find((p: any) => p.id === (e.actorId || e.actor_id));
        const payload = e.payload || e.payload_json || {};
        const eventType = e.eventType || e.event_type || 'LEDGER_EVENT';
        const description = e.description || payload.description || payload.reason || `${eventType.replace(/_/g, ' ')} recorded`;
        return {
          id: e.id,
          tripId: e.tripId || e.trip_id,
          eventType,
          actorId: e.actorId || e.actor_id || 'system',
          actorName: e.actorName || actor?.name || 'Traveler',
          timestamp: e.timestamp || e.created_at || new Date().toISOString(),
          description,
          payload,
          sequenceNum: Number(e.sequenceNum ?? e.sequence_num ?? 1),
        };
      });

      const formattedPayments = (rawPayments || []).map((p: any) => ({
        id: p.id,
        tripId: p.trip_id || p.tripId,
        payerId: p.payer_id || p.payerId,
        payeeId: p.payee_id || p.payeeId,
        amount: Number(p.amount || 0),
        note: p.note || undefined,
        createdAt: p.created_at || p.createdAt,
      }));

      return NextResponse.json({
        success: true,
        trip: formattedTrip,
        participants: formattedParticipants,
        bookings: formattedBookings,
        expenses: formattedExpenses,
        payments: formattedPayments,
        events: formattedEvents,
      });
    }

    // 3. Return all Trips
    const allTrips = await sql`SELECT * FROM trips ORDER BY created_at DESC LIMIT 50;`;
    const formattedAllTrips = allTrips.map((t: any) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      baseCurrency: t.base_currency || 'INR',
      startDate: t.start_date,
      endDate: t.end_date,
      budgetCeiling: Number(t.budget_ceiling || 0),
      inviteCode: t.invite_code,
      organizerId: t.organizer_id,
      createdAt: t.created_at,
    }));

    return NextResponse.json({ success: true, trips: formattedAllTrips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trip, participants } = body;

    if (!trip || !trip.id || !trip.title) {
      return NextResponse.json({ success: false, error: 'Missing trip details' }, { status: 400 });
    }

    const saved = await saveTripToNeon(trip, participants || []);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tripId: trip.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
