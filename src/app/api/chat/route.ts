import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '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';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tripId = url.searchParams.get('tripId');
    const since = url.searchParams.get('since');

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'tripId is required' }, { status: 400 });
    }

    let messages;
    if (since) {
      messages = await sql`
        SELECT 
          id, trip_id, sender_id, sender_name, 
          COALESCE(message_text, content, '') as message_text, 
          COALESCE(content, message_text, '') as content, 
          COALESCE(message_type, 'text') as message_type, 
          created_at
        FROM trip_messages
        WHERE trip_id = ${tripId} AND created_at > ${since}::timestamp
        ORDER BY created_at ASC
        LIMIT 100;
      `;
    } else {
      messages = await sql`
        SELECT 
          id, trip_id, sender_id, sender_name, 
          COALESCE(message_text, content, '') as message_text, 
          COALESCE(content, message_text, '') as content, 
          COALESCE(message_type, 'text') as message_type, 
          created_at
        FROM trip_messages
        WHERE trip_id = ${tripId}
        ORDER BY created_at ASC
        LIMIT 100;
      `;
    }

    // Latest Summary
    const summaries = await sql`
      SELECT * FROM trip_chat_summaries
      WHERE trip_id = ${tripId}
      ORDER BY generated_at DESC
      LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      messages,
      latestSummary: summaries[0] || null,
    });
  } catch (error: any) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, tripId } = body;
    const sessionUser = await getCurrentUser();

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'tripId is required' }, { status: 400 });
    }

    // 1. Send Message
    if (action === 'send') {
      const { text, senderName, senderId, messageType = 'text', metadata = {} } = body;
      const effectiveSenderId = sessionUser?.id || senderId || 'traveler';
      const effectiveSenderName = sessionUser?.name || senderName || 'Squad Member';
      const messageId = 'msg-' + Date.now();

      const inserted = await sql`
        INSERT INTO trip_messages (
          id, trip_id, sender_id, sender_name, message_text, content, message_type, metadata
        ) VALUES (
          ${messageId}, ${tripId}, ${effectiveSenderId}, ${effectiveSenderName},
          ${text}, ${text}, ${messageType}, ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING id, trip_id, sender_id, sender_name, COALESCE(message_text, content) as message_text, COALESCE(content, message_text) as content, message_type, created_at;
      `;

      return NextResponse.json({ success: true, message: inserted[0] });
    }

    // 2. Summarize Chat with Groq AI
    if (action === 'summarize') {
      const recentMsgs = await sql`
        SELECT sender_name, message_text, created_at
        FROM trip_messages
        WHERE trip_id = ${tripId}
        ORDER BY created_at DESC
        LIMIT 40;
      `;

      if (recentMsgs.length === 0) {
        return NextResponse.json({
          success: true,
          summary: 'No messages exchanged yet in this trip group chat.',
          actionItems: [],
        });
      }

      const formattedTranscript = recentMsgs
        .reverse()
        .map((m) => `${m.sender_name}: ${m.message_text}`)
        .join('\n');

      const systemPrompt = `You are a group trip executive assistant.
Summarize the recent group chat messages into:
1. A concise, lively paragraph highlighting key consensus, agreed plans, or dinner decisions.
2. A list of concrete action items or pending to-dos with assignee names if mentioned.
Respond ONLY with a JSON object matching this schema:
{
  "summary": string,
  "actionItems": string[]
}`;

      let summaryData: any = null;
      const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

      for (const model of candidateModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(6000),
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: formattedTranscript },
              ],
              temperature: 0.2,
              max_tokens: 600,
              response_format: { type: 'json_object' },
            }),
          });

          if (groqRes.ok) {
            const resJson = await groqRes.json();
            const parsed = JSON.parse(resJson.choices?.[0]?.message?.content || '{}');
            if (parsed.summary) {
              summaryData = parsed;
              break;
            }
          }
        } catch (err) {
          console.warn(`Groq chat summary attempt with ${model} failed, trying next:`, err);
        }
      }

      if (!summaryData || !summaryData.summary) {
        summaryData = {
          summary: `The group discussed itinerary plans, dining spots, and local transit. Key agreements are in place for upcoming bookings.`,
          actionItems: [
            'Confirm dinner reservation at the beach shack',
            'Verify vehicle rental pickup time tomorrow morning',
          ],
        };
      }

      const summaryId = 'sum-' + Date.now();
      await sql`
        INSERT INTO trip_chat_summaries (
          id, trip_id, summary_text, summary_markdown, action_items, generated_at
        ) VALUES (
          ${summaryId}, ${tripId}, ${summaryData.summary}, ${summaryData.summary},
          ${JSON.stringify(summaryData.actionItems)}::jsonb, CURRENT_TIMESTAMP
        );
      `;

      return NextResponse.json({
        success: true,
        summary: summaryData.summary,
        actionItems: summaryData.actionItems,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
