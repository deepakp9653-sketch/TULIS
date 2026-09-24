import { NextResponse } from 'next/server';
import { parseNaturalChatExpense } from '@/lib/ledger-engine';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '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';

export async function POST(request: Request) {
  try {
    const { text, participants } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing input text' }, { status: 400 });
    }

    const participantList = (participants || [])
      .map((p: any) => `${p.name} (id: ${p.id})`)
      .join(', ');

    const prompt = `Extract expense details as valid JSON with keys { "title": string, "totalAmount": number, "category": "transport"|"lodging"|"activity"|"food"|"other", "payerName": string, "splitWith": string[] } from text:
"${text}"
Available members: ${participantList}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 350,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Map payerName to participant id if available
          let payerId = participants?.[0]?.id || 'p1';
          if (parsed.payerName) {
            const foundPayer = participants?.find((p: any) =>
              p.name.toLowerCase().includes(parsed.payerName.toLowerCase())
            );
            if (foundPayer) payerId = foundPayer.id;
          }

          // Map splitWith to participant ids
          const detectedParticipantIds: string[] = [];
          if (Array.isArray(parsed.splitWith)) {
            parsed.splitWith.forEach((name: string) => {
              const matched = participants?.find((p: any) =>
                p.name.toLowerCase().includes(name.toLowerCase())
              );
              if (matched && !detectedParticipantIds.includes(matched.id)) {
                detectedParticipantIds.push(matched.id);
              }
            });
          }

          return NextResponse.json({
            success: true,
            data: {
              title: parsed.title || text.slice(0, 30),
              totalAmount: Number(parsed.totalAmount) || 0,
              category: parsed.category || 'food',
              payerId,
              detectedParticipantIds:
                detectedParticipantIds.length > 0
                  ? detectedParticipantIds
                  : (participants || []).map((p: any) => p.id),
              confidence: 0.96,
              aiSummary: `AI parsed: ${parsed.title || 'Expense'} of ₹${parsed.totalAmount || 0}`,
            },
            model: 'AI Neural Engine',
          });
        }
      }
    } catch (apiErr) {
      console.warn('Groq fetch failed, using local engine fallback:', apiErr);
    }

    // Graceful fallback to local regex engine
    const localParsed = parseNaturalChatExpense(text, participants || []);
    return NextResponse.json({
      success: true,
      data: localParsed,
      fallback: true,
      model: 'Local NLP Engine (Zero-Latency Fallback)',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
