import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';
import { processReceiptWithOpenCvOcr } from '@/lib/opencv-ocr-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, rawTextOverride, tripId = 'default-trip', userId: rawUserId, useAiRefinement = true } = body;

    if (!imageBase64 && !rawTextOverride) {
      return NextResponse.json({ success: false, error: 'Receipt image or text is required' }, { status: 400 });
    }

    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || rawUserId || 'traveler';

    // Format Base64 image URL or placeholder
    let formattedImageUrl = imageBase64 || '';
    if (imageBase64 && !imageBase64.startsWith('data:')) {
      formattedImageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    // 1. Execute OpenCV + Tesseract Deterministic OCR Engine
    // (with OpenAI -> Groq assistance cascade)
    const ocrResult = await processReceiptWithOpenCvOcr(formattedImageUrl, {
      tripId,
      useAiRefinement,
      rawTextOverride,
    });

    const extractionId = 'rcpt-' + Date.now();

    // 2. Persist extraction event into Neon DB
    try {
      await sql`
        INSERT INTO receipt_extractions (
          id, trip_id, image_url, extracted_data, status
        ) VALUES (
          ${extractionId}, ${tripId},
          ${formattedImageUrl.slice(0, 100) + '...'},
          ${JSON.stringify(ocrResult)}::jsonb,
          'processed'
        );
      `;
    } catch (dbErr) {
      // Quiet persistence fallback
    }

    return NextResponse.json({
      success: true,
      extractionId,
      extracted: ocrResult,
      engineUsed: ocrResult.engineUsed,
      rawOcrText: ocrResult.rawOcrText,
      previewUrl: formattedImageUrl,
    });
  } catch (error: any) {
    console.error('Receipt OCR route failure:', error);
    return NextResponse.json({ success: false, error: error.message || 'OCR processing failed' }, { status: 500 });
  }
}
