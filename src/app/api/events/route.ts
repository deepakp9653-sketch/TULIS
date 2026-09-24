import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const events = await sql`
      SELECT id, trip_id as "tripId", event_type as "eventType", actor_id as "actorId",
             payload_json as payload, sequence_num as "sequenceNum", created_at as "timestamp"
      FROM events
      ORDER BY sequence_num DESC
      LIMIT 100;
    `;
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, eventType, actorId, payload } = body;

    const result = await sql`
      INSERT INTO events (id, trip_id, event_type, actor_id, payload_json)
      VALUES (${'evt-' + Date.now()}, ${tripId}, ${eventType}, ${actorId}, ${JSON.stringify(payload)})
      RETURNING id, sequence_num;
    `;

    return NextResponse.json({ success: true, event: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
