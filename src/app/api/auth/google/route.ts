import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyGoogleToken, createSessionToken, getUserAccessibleTrips, AuthSessionUser } from '@/lib/auth-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ success: false, error: 'Google credential token is required' }, { status: 400 });
    }

    // Verify Google ID token
    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser) {
      return NextResponse.json({ success: false, error: 'Invalid or expired Google authentication token' }, { status: 401 });
    }

    const { googleId, email, name, avatar } = googleUser;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists by email
    const existingUsers = await sql`
      SELECT id, name, email, role, avatar, upi_id as "upiId", email_verified as "emailVerified",
             gender, phone, profile_completed as "profileCompleted"
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;

    let finalUser: AuthSessionUser;
    let needsProfileCompletion = false;

    if (existingUsers && existingUsers.length > 0) {
      const u = existingUsers[0];
      // Update Google ID and ensure email is marked verified
      await sql`
        UPDATE users
        SET google_id = ${googleId},
            email_verified = TRUE,
            avatar = COALESCE(avatar, ${avatar}),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${u.id};
      `;

      // If user hasn't completed their profile (gender/phone missing or profile_completed is false)
      needsProfileCompletion = !Boolean(u.profileCompleted && u.gender && u.phone);

      finalUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'traveler',
        avatar: u.avatar || avatar,
        upiId: u.upiId || `${u.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        emailVerified: true,
        gender: u.gender || undefined,
        phone: u.phone || undefined,
        profileCompleted: Boolean(u.profileCompleted),
      };
    } else {
      // Create new user from Google profile
      const newUserId = 'u-' + Date.now();
      const defaultUpi = `${name.toLowerCase().replace(/\s+/g, '')}@upi`;

      await sql`
        INSERT INTO users (id, name, email, password, google_id, role, avatar, upi_id, email_verified, profile_completed)
        VALUES (${newUserId}, ${name}, ${cleanEmail}, NULL, ${googleId}, 'traveler', ${avatar}, ${defaultUpi}, TRUE, FALSE);
      `;

      needsProfileCompletion = true;

      finalUser = {
        id: newUserId,
        name,
        email: cleanEmail,
        role: 'traveler',
        avatar,
        upiId: defaultUpi,
        emailVerified: true,
        profileCompleted: false,
      };
    }

    // Generate production signed JWT session
    const sessionToken = await createSessionToken(finalUser);
    const accessibleTrips = await getUserAccessibleTrips(finalUser.id, finalUser.email);

    const response = NextResponse.json({
      success: true,
      user: finalUser,
      needsProfileCompletion,
      accessibleTrips,
      message: 'Signed in with Google successfully',
    });

    // Set HTTP-Only session cookie
    response.cookies.set({
      name: 'tulis_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Google auth route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
