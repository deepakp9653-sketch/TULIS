import { NextResponse } from 'next/server';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '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';

export async function POST(request: Request) {
  try {
    const { userName, netBalance, debts, tripTitle } = await request.json();

    const prompt = `You are a friendly, transparent financial assistant for an Indian group travel app called FareShare.
The user ${userName} has a net balance of ₹${netBalance} in the trip "${tripTitle || 'Trip'}".
Their settlement relationships:
${JSON.stringify(debts || [])}

Provide a concise, 2-3 sentence, crystal-clear explanation of why their balance is what it is, who they need to pay or collect from via UPI, and reassure them that all math is zero-sum verified. Keep it friendly, authentic, and free of robotic jargon.`;

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
          temperature: 0.3,
          max_tokens: 250,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content || '';
        if (explanation) {
          return NextResponse.json({
            success: true,
            explanation,
            model: 'AI Neural Engine',
          });
        }
      }
    } catch (apiErr) {
      console.warn('Groq explain balance fallback:', apiErr);
    }

    // Default fallback
    const fallbackText =
      netBalance > 0
        ? `You are owed a net total of ₹${netBalance.toFixed(0)} across group expenses. Once your squad members settle their dues via UPI, your balance will be fully settled.`
        : netBalance < 0
        ? `You have a net payable of ₹${Math.abs(netBalance).toFixed(0)} for shared bookings. Settle up via UPI to bring your balance to zero.`
        : `All your expenses and settlements are completely even. You neither owe nor are owed any money.`;

    return NextResponse.json({
      success: true,
      explanation: fallbackText,
      fallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
