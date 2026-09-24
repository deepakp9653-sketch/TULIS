import { NextResponse } from 'next/server';
import { sql, findTripByInviteCodeInNeon, addParticipantToTripInNeon, logEventToNeon } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inviteCode, name, email, upiId, avatarUrl } = body;

    if (!inviteCode || !name) {
      return NextResponse.json({ success: false, error: 'Invite code and name are required' }, { status: 400 });
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const data = await findTripByInviteCodeInNeon(cleanCode);

    if (!data) {
      return NextResponse.json({ success: false, error: 'Invalid 6-character Trip Invite Code. Please verify with your organizer.' }, { status: 404 });
    }

    const targetTrip = data.trip;
    const existingParts = data.participants || [];

    // Check if participant already exists by email or name
    let participant = existingParts.find(
      (p: any) => (email && p.email?.toLowerCase() === email.toLowerCase()) || p.name.toLowerCase() === name.toLowerCase()
    );

    if (!participant) {
      const newPartId = 'p-joined-' + Date.now();
      participant = {
        id: newPartId,
        tripId: targetTrip.id,
        name: name.trim(),
        email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@fareshare.in`,
        avatarUrl: avatarUrl?.trim() || '',
        isOrganizer: false,
        status: 'active',
        upiId: upiId?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
        weight: 1,
        roomTier: 'standard',
      };

      await addParticipantToTripInNeon(targetTrip.id, participant);
      await logEventToNeon(targetTrip.id, 'TRIP_JOINED_VIA_CODE', participant.id, {
        travelerName: participant.name,
        inviteCode: cleanCode,
      });
    }

    // Refetch latest participants and trip details
    const latestData = await findTripByInviteCodeInNeon(cleanCode);

    const formattedTrip = {
      id: targetTrip.id,
      title: targetTrip.title,
      destination: targetTrip.destination,
      baseCurrency: targetTrip.base_currency || 'INR',
      startDate: targetTrip.start_date,
      endDate: targetTrip.end_date,
      budgetCeiling: Number(targetTrip.budget_ceiling || 0),
      inviteCode: targetTrip.invite_code,
      organizerId: targetTrip.organizer_id,
      createdAt: targetTrip.created_at,
    };

    const formattedParticipants = (latestData?.participants || []).map((p: any) => ({
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

    return NextResponse.json({
      success: true,
      trip: formattedTrip,
      currentParticipant: participant,
      participants: formattedParticipants,
      bookings: latestData?.bookings || [],
      expenses: latestData?.expenses || [],
      events: latestData?.events || [],
    });
  } catch (error: any) {
    console.error('Join trip error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
