import { NextResponse } from 'next/server';
import {
  sql,
  saveTripToNeon,
  saveBookingToNeon,
  findTripByInviteCodeInNeon,
  fetchTripExpensesWithAllocations,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';
import { scrapeDestinationData } from '@/lib/destination-scraper';

// In-memory cache for capability delegation (tripId -> participantId -> string[])
const tripCapabilitiesCache = new Map<string, Record<string, string[]>>();

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

    // 3. User Account Scoped Trips
    // Strictly filter trips associated with the authenticated user or requested email
    const currentUser = await getCurrentUser();
    const requestedEmail = searchParams.get('email');
    const myTripsOnly = searchParams.get('myTrips') === 'true';

    const targetEmail = (requestedEmail || currentUser?.email || '').trim().toLowerCase();
    const targetUserId = currentUser?.id || '';

    // If an account identity is provided (either from session cookie, email query param, or myTrips flag)
    if (targetEmail || targetUserId || myTripsOnly) {
      if (!targetEmail && !targetUserId) {
        // Requested user trips but unauthenticated / no identity
        return NextResponse.json({ success: true, trips: [] });
      }

      const userTrips = await sql`
        SELECT DISTINCT t.*,
          CASE 
            WHEN (t.organizer_id = ${targetUserId} AND ${targetUserId} != '')
                 OR LOWER(t.organizer_id) = ${targetEmail} 
                 OR EXISTS (
                   SELECT 1 FROM participants p2 
                   WHERE p2.trip_id = t.id AND LOWER(p2.email) = ${targetEmail} AND p2.is_organizer = true
                 ) THEN 'organizer'
            ELSE 'member'
          END as user_role
        FROM trips t
        WHERE 
          (t.organizer_id = ${targetUserId} AND ${targetUserId} != '')
          OR LOWER(t.organizer_id) = ${targetEmail}
          OR EXISTS (
            SELECT 1 FROM participants p 
            WHERE p.trip_id = t.id AND (
              LOWER(p.email) = ${targetEmail} 
              OR (${targetUserId} != '' AND p.id = ${targetUserId})
            )
          )
        ORDER BY t.created_at DESC;
      `;

      const formattedUserTrips = userTrips.map((t: any) => ({
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
        userRole: t.user_role || 'member',
      }));

      return NextResponse.json({ success: true, trips: formattedUserTrips });
    }

    // Unauthenticated guest query: return empty list to protect private group ledgers
    return NextResponse.json({ success: true, trips: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // F1.4: Auto-Rebooking Suggestions on Cancellation
    if (action === 'get-cancellation-alternatives') {
      const {
        destination = 'Goa',
        category = 'activity',
        currentVendor = '',
        budgetLimit = 5000,
      } = body;

      const scraped = await scrapeDestinationData(destination, Math.max(budgetLimit * 3, 10000), 3);
      const pool =
        category === 'stay' || category === 'lodging'
          ? scraped.hotels
          : category === 'dining' || category === 'food'
          ? scraped.dining
          : scraped.activities;

      const normCurrent = (currentVendor || '').toLowerCase().trim();
      const filtered = pool.filter(
        (p) =>
          !normCurrent ||
          (!p.name.toLowerCase().includes(normCurrent) && !normCurrent.includes(p.name.toLowerCase()))
      );

      const candidates = (filtered.length >= 2 ? filtered : pool).slice(0, 3).map((item) => ({
        title: item.name,
        vendor: item.name,
        category,
        estimatedCost: item.estimatedCost || budgetLimit,
        description: item.description,
        rating: item.rating || 4.7,
        address: (item as any).area || destination,
        highlights: ['Verified Regional Venue', 'Available for Instant Replacement'],
      }));

      return NextResponse.json({ success: true, alternatives: candidates });
    }

    // F1.5: Trip DNA: Clone a Past Trip's Itinerary Skeleton
    if (action === 'clone-itinerary') {
      const {
        sourceTripId,
        targetTitle,
        targetStartDate,
        targetEndDate,
        selectedBookingIds,
        targetUserId,
      } = body;
      const currentUser = await getCurrentUser();
      const userId = targetUserId || currentUser?.id || 'traveler-me';

      const sourceTrips = await sql`SELECT * FROM trips WHERE id = ${sourceTripId} LIMIT 1;`;
      if (sourceTrips.length === 0) {
        return NextResponse.json({ success: false, error: 'Source trip not found' }, { status: 404 });
      }
      const sourceTrip = sourceTrips[0];
      const sourceBookings = await sql`SELECT * FROM bookings WHERE trip_id = ${sourceTripId};`;

      const newTripId = 'trip-' + Date.now();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const newInviteCode =
        ((sourceTrip.destination || 'TRP').slice(0, 3).toUpperCase() || 'TRP') + suffix;

      const newTrip = {
        id: newTripId,
        title: targetTitle || `${sourceTrip.title} (Cloned)`,
        destination: sourceTrip.destination,
        baseCurrency: sourceTrip.base_currency || 'INR',
        startDate: targetStartDate || sourceTrip.start_date || new Date().toISOString().split('T')[0],
        endDate: targetEndDate || sourceTrip.end_date || null,
        budgetCeiling: Number(sourceTrip.budget_ceiling || 50000),
        inviteCode: newInviteCode,
        organizerId: userId,
      };

      const creatorParticipant = {
        id: userId.startsWith('p') ? userId : 'p-' + Date.now(),
        name: currentUser?.name || 'Organizer',
        email: currentUser?.email || 'organizer@tulis.in',
        isOrganizer: true,
        status: 'active',
        upiId: `${(currentUser?.name || 'organizer').toLowerCase().replace(/\s+/g, '')}@upi`,
        weight: 1,
        roomTier: 'suite',
      };

      await saveTripToNeon(newTrip, [creatorParticipant]);

      // Filter and clone bookings
      const allowedIds =
        Array.isArray(selectedBookingIds) && selectedBookingIds.length > 0
          ? new Set(selectedBookingIds)
          : null;
      const bookingsToClone = allowedIds
        ? sourceBookings.filter((b: any) => allowedIds.has(b.id))
        : sourceBookings;

      const clonedBookings = [];
      for (let i = 0; i < bookingsToClone.length; i++) {
        const b = bookingsToClone[i];
        const newBookingId = 'bk-' + Date.now() + '-' + i;
        const newBooking = {
          id: newBookingId,
          tripId: newTripId,
          category: b.category,
          title: b.title,
          vendor: b.vendor || '',
          startTime: targetStartDate || b.start_time,
          endTime: targetEndDate || b.end_time,
          estimatedCost: Number(b.estimated_cost || 0),
          actualCost: Number(b.estimated_cost || 0), // reset actual cost to estimated baseline
          status: 'confirmed',
          participantIds: [creatorParticipant.id],
        };
        await saveBookingToNeon(newBooking);
        clonedBookings.push(newBooking);
      }

      return NextResponse.json({
        success: true,
        newTrip,
        clonedBookings,
        message: `Trip skeleton successfully cloned with ${clonedBookings.length} bookings!`,
      });
    }

    // F3.1: Vendor Reliability Memory
    if (action === 'vendor-reliability') {
      const { vendorName = '' } = body;
      if (!vendorName.trim()) {
        return NextResponse.json({
          success: true,
          isNew: true,
          score: 100,
          totalBookings: 0,
          varianceAvg: 0,
          status: 'new',
          label: '✨ First Time Vendor',
        });
      }

      const rows = await sql`
        SELECT estimated_cost, actual_cost, status 
        FROM bookings 
        WHERE LOWER(TRIM(vendor)) = LOWER(TRIM(${vendorName}));
      `;

      if (rows.length === 0) {
        return NextResponse.json({
          success: true,
          isNew: true,
          score: 100,
          totalBookings: 0,
          varianceAvg: 0,
          status: 'new',
          label: '✨ First Time Vendor',
        });
      }

      let totalVariance = 0;
      let cancelledCount = 0;
      for (const r of rows) {
        const est = Number(r.estimated_cost || 0);
        const act = Number(r.actual_cost || 0);
        if (est > 0) {
          totalVariance += ((act - est) / est) * 100;
        }
        if (r.status === 'cancelled') cancelledCount++;
      }

      const varianceAvg = Number((totalVariance / rows.length).toFixed(1));
      let score = 100;
      if (varianceAvg > 5) score -= Math.min(35, varianceAvg);
      if (cancelledCount > 0) score -= Math.min(30, (cancelledCount / rows.length) * 40);
      score = Math.max(10, Math.round(score));

      return NextResponse.json({
        success: true,
        isNew: false,
        score,
        totalBookings: rows.length,
        varianceAvg,
        cancelledCount,
        label:
          score >= 90
            ? `${score}% Reliable • On-budget track record`
            : score >= 75
            ? `${score}% Moderate • Occasional surcharge`
            : `⚠️ ${score}% Caution • +${varianceAvg}% historical variance`,
      });
    }

    // F2.3: Capability-Scoped Delegation
    if (action === 'get-capabilities') {
      const { tripId } = body;
      const cached = tripCapabilitiesCache.get(tripId) || {};
      return NextResponse.json({ success: true, capabilities: cached });
    }

    if (action === 'grant-capability') {
      const { tripId, participantId, capability, grantedBy = 'organizer' } = body;
      if (!tripId || !participantId || !capability) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
      }

      let tripCaps = tripCapabilitiesCache.get(tripId);
      if (!tripCaps) {
        tripCaps = {};
        tripCapabilitiesCache.set(tripId, tripCaps);
      }
      if (!tripCaps[participantId]) {
        tripCaps[participantId] = [];
      }
      if (!tripCaps[participantId].includes(capability)) {
        tripCaps[participantId].push(capability);
      }

      return NextResponse.json({
        success: true,
        participantId,
        capabilities: tripCaps[participantId],
        message: `Granted capability "${capability}"`,
      });
    }

    if (action === 'revoke-capability') {
      const { tripId, participantId, capability } = body;
      if (!tripId || !participantId || !capability) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
      }

      const tripCaps = tripCapabilitiesCache.get(tripId);
      if (tripCaps && tripCaps[participantId]) {
        tripCaps[participantId] = tripCaps[participantId].filter((c) => c !== capability);
      }

      return NextResponse.json({
        success: true,
        participantId,
        capabilities: tripCaps?.[participantId] || [],
        message: `Revoked capability "${capability}"`,
      });
    }

    // F2.5: Organizer Succession
    if (action === 'request-succession') {
      const { tripId, currentOrganizerId, successorParticipantId, successorName } = body;
      if (!tripId || !successorParticipantId) {
        return NextResponse.json({ success: false, error: 'tripId and successorParticipantId are required' }, { status: 400 });
      }

      try {
        await sql`
          INSERT INTO events (id, trip_id, event_type, actor_id, payload_json)
          VALUES (
            ${'ev-succ-' + Date.now()},
            ${tripId},
            'SUCCESSION_REQUESTED',
            ${currentOrganizerId || 'organizer'},
            ${JSON.stringify({ successorParticipantId, successorName, timestamp: new Date().toISOString() })}::jsonb
          );
        `;
      } catch (e) {
        console.warn('Succession event log warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Succession offer dispatched to ${successorName || 'successor'}`,
      });
    }

    if (action === 'claim-succession') {
      const { tripId, successorParticipantId, newOrganizerName } = body;
      if (!tripId || !successorParticipantId) {
        return NextResponse.json({ success: false, error: 'tripId and successorParticipantId are required' }, { status: 400 });
      }

      try {
        await sql`UPDATE trips SET organizer_id = ${successorParticipantId} WHERE id = ${tripId};`;
        await sql`UPDATE participants SET is_organizer = (id = ${successorParticipantId}) WHERE trip_id = ${tripId};`;
        await sql`
          INSERT INTO events (id, trip_id, event_type, actor_id, payload_json)
          VALUES (
            ${'ev-succ-' + Date.now()},
            ${tripId},
            'SUCCESSION_COMPLETED',
            ${successorParticipantId},
            ${JSON.stringify({ newOrganizerId: successorParticipantId, newOrganizerName, timestamp: new Date().toISOString() })}::jsonb
          );
        `;
      } catch (e) {
        console.warn('Succession claim DB sync warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Organizer succession completed. ${newOrganizerName || 'Successor'} is now the active organizer.`,
      });
    }

    if (action === 'reclaim-organizer') {
      const { tripId, originalOrganizerId, originalOrganizerName } = body;
      if (!tripId || !originalOrganizerId) {
        return NextResponse.json({ success: false, error: 'tripId and originalOrganizerId are required' }, { status: 400 });
      }

      try {
        await sql`UPDATE trips SET organizer_id = ${originalOrganizerId} WHERE id = ${tripId};`;
        await sql`UPDATE participants SET is_organizer = (id = ${originalOrganizerId}) WHERE trip_id = ${tripId};`;
        await sql`
          INSERT INTO events (id, trip_id, event_type, actor_id, payload_json)
          VALUES (
            ${'ev-succ-' + Date.now()},
            ${tripId},
            'SUCCESSION_RECLAIMED',
            ${originalOrganizerId},
            ${JSON.stringify({ reclaimerId: originalOrganizerId, originalOrganizerName, timestamp: new Date().toISOString() })}::jsonb
          );
        `;
      } catch (e) {
        console.warn('Succession reclaim DB sync warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Organizer role successfully reclaimed by ${originalOrganizerName || 'original creator'}.`,
      });
    }

    // FC.8: Consolidated Multi-Employee Trip & Booking Wizard
    if (action === 'bulk-create-corporate-trip') {
      const {
        title,
        destination,
        startDate,
        endDate,
        budgetCeiling = 100000,
        costCenter = 'CC-GLOBAL-801',
        department = 'General',
        employees = [],
        sharedBookings = [],
      } = body;

      if (!title || !destination) {
        return NextResponse.json({ success: false, error: 'Title and Destination are required' }, { status: 400 });
      }

      const currentUser = await getCurrentUser();
      const organizerId = currentUser?.id || 'traveler-me';
      const organizerEmail = currentUser?.email || 'organizer@tulis.in';
      const organizerName = currentUser?.name || 'Travel Director';

      const tripId = 'trip-corp-' + Date.now();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = (destination.slice(0, 3).toUpperCase() || 'CRP') + suffix;

      const newTrip = {
        id: tripId,
        title,
        destination,
        baseCurrency: 'INR',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || null,
        budgetCeiling: Number(budgetCeiling || 100000),
        inviteCode,
        organizerId,
      };

      const participantsList = [
        {
          id: organizerId.startsWith('p') ? organizerId : 'p-' + Date.now(),
          name: organizerName,
          email: organizerEmail,
          isOrganizer: true,
          status: 'active',
          upiId: `${organizerName.toLowerCase().replace(/\\s+/g, '')}@upi`,
          weight: 1,
          roomTier: 'suite',
        },
      ];

      // Add each employee as a participant
      employees.forEach((emp: any, idx: number) => {
        const empEmail = typeof emp === 'string' ? emp.trim() : (emp.email || '').trim();
        const empName = typeof emp === 'string' ? emp.split('@')[0] : (emp.name || emp.email.split('@')[0]);
        if (!empEmail) return;
        if (empEmail.toLowerCase() === organizerEmail.toLowerCase()) return;

        participantsList.push({
          id: `p-corp-${Date.now()}-${idx}`,
          name: empName,
          email: empEmail,
          isOrganizer: false,
          status: 'active',
          upiId: `${empName.toLowerCase().replace(/\\s+/g, '')}@upi`,
          weight: 1,
          roomTier: 'standard',
        });
      });

      // Save trip & roster to Neon DB
      await saveTripToNeon(newTrip, participantsList);

      // Create shared bookings assigned to all participant IDs
      const allParticipantIds = participantsList.map((p) => p.id);
      const createdBookings = [];

      for (let i = 0; i < sharedBookings.length; i++) {
        const bk = sharedBookings[i];
        const newBkId = `bk-corp-${Date.now()}-${i}`;
        const newBooking = {
          id: newBkId,
          tripId,
          category: bk.category || 'stay',
          title: bk.title,
          vendor: bk.vendor || '',
          startTime: startDate || new Date().toISOString(),
          endTime: endDate || undefined,
          estimatedCost: Number(bk.estimatedCost || 0),
          actualCost: Number(bk.estimatedCost || 0),
          status: 'confirmed',
          confirmationRef: bk.confirmationRef || undefined,
          participantIds: allParticipantIds,
        };
        await saveBookingToNeon(newBooking);
        createdBookings.push(newBooking);
      }

      return NextResponse.json({
        success: true,
        trip: newTrip,
        participants: participantsList,
        bookings: createdBookings,
        message: `Corporate trip "${title}" created with ${participantsList.length} employees and ${createdBookings.length} shared bookings.`,
      });
    }

    // F-M2: Pool Contribution Mode (Add to Squad Kitty)
    if (action === 'add-pool-contribution') {
      const { tripId, participantId, amount, note = 'Kitty contribution' } = body;
      if (!tripId || !participantId || !amount) {
        return NextResponse.json({ success: false, error: 'Missing contribution parameters' }, { status: 400 });
      }

      const newContribution = {
        id: `pool-c-${Date.now()}`,
        tripId,
        participantId,
        amount: Number(amount),
        note,
        createdAt: new Date().toISOString(),
      };

      try {
        await sql`
          INSERT INTO events (id, trip_id, event_type, actor_id, description, payload_json, sequence_num, created_at)
          VALUES (
            ${'evt-' + Date.now()},
            ${tripId},
            'POOL_CONTRIBUTION',
            ${participantId},
            ${`Pool contribution of ₹${amount} recorded`},
            ${JSON.stringify(newContribution)},
            1,
            NOW()
          );
        `;
      } catch (err) {
        console.warn('Neon DB event write for pool contribution:', err);
      }

      return NextResponse.json({
        success: true,
        contribution: newContribution,
        message: `Contributed ₹${amount} to common squad kitty!`,
      });
    }

    // Default: Standard Save Trip to Neon
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
