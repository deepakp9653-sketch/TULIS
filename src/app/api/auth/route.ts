import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  generateNumericOtp,
  createSessionToken,
  getCurrentUser,
  getUserAccessibleTrips,
  AuthSessionUser,
} from '@/lib/auth-service';
import { sendVerificationOtpEmail } from '@/lib/email-service';
import { DEMO_USERS } from '@/lib/user-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 1. Check current logged-in session user
    if (action === 'me') {
      const sessionUser = await getCurrentUser();
      if (!sessionUser) {
        return NextResponse.json({ success: true, user: null });
      }

      // Fetch latest profile from DB
      const dbUsers = await sql`
        SELECT id, name, email, role, avatar, upi_id as "upiId", email_verified as "emailVerified",
               gender, phone, profile_completed as "profileCompleted"
        FROM users
        WHERE id = ${sessionUser.id}
        LIMIT 1;
      `;

      const user = dbUsers.length > 0 ? dbUsers[0] : sessionUser;
      const accessibleTrips = await getUserAccessibleTrips(user.id, user.email);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'traveler',
          avatar: user.avatar || '',
          upiId: (user as any).upiId || (user as any).upi_id || '',
          emailVerified: Boolean((user as any).emailVerified ?? (user as any).email_verified),
          gender: (user as any).gender || undefined,
          phone: (user as any).phone || undefined,
          profileCompleted: Boolean((user as any).profileCompleted ?? (user as any).profile_completed),
          isCorporate: Boolean((sessionUser as any).isCorporate),
          organizationId: (sessionUser as any).organizationId,
          organizationName: (sessionUser as any).organizationName,
          organizationDomain: (sessionUser as any).organizationDomain,
          department: (sessionUser as any).department,
          employeeId: (sessionUser as any).employeeId,
          costCenter: (sessionUser as any).costCenter,
        },
        accessibleTrips,
      });
    }

    // 2. Return ONLY curated sandbox demo users (NEVER expose registered users for privacy)
    return NextResponse.json({
      success: true,
      users: DEMO_USERS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ----------------------------------------------------
    // Action: REGISTER
    // ----------------------------------------------------
    if (action === 'register') {
      const { name, email, password, upiId } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Name, email, and password are required.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      // Check if user already exists
      const existing = await sql`
        SELECT id, email, email_verified as "emailVerified"
        FROM users
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;

      const otp = generateNumericOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
      const hashedPassword = await hashPassword(password);
      const defaultUpi = upiId?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@upi`;

      let userId: string;

      if (existing.length > 0) {
        const u = existing[0];
        if (u.emailVerified) {
          return NextResponse.json(
            { success: false, error: 'An account with this email already exists. Please log in.' },
            { status: 409 }
          );
        }

        // Unverified account: update password and issue new OTP
        userId = u.id;
        await sql`
          UPDATE users
          SET name = ${name.trim()},
              password_hash = ${hashedPassword},
              password = ${password},
              upi_id = ${defaultUpi},
              verification_otp = ${otp},
              verification_expires_at = ${expiresAt}
          WHERE id = ${userId};
        `;
      } else {
        // Create new user record
        userId = 'u-' + Date.now();
        await sql`
          INSERT INTO users (id, name, email, password_hash, password, role, upi_id, email_verified, verification_otp, verification_expires_at)
          VALUES (
            ${userId},
            ${name.trim()},
            ${cleanEmail},
            ${hashedPassword},
            ${password},
            'traveler',
            ${defaultUpi},
            FALSE,
            ${otp},
            ${expiresAt}
          );
        `;
      }

      // Send verification email via Resend
      const emailRes = await sendVerificationOtpEmail(cleanEmail, otp, name.trim());
      if (!emailRes.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              emailRes.error ||
              'Could not dispatch verification email via Resend. Please check your email address.',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        userId,
        email: cleanEmail,
        message: 'Verification code sent to your email via Resend.',
      });
    }

    // ----------------------------------------------------
    // Action: VERIFY-OTP
    // ----------------------------------------------------
    if (action === 'verify-otp') {
      const { email, otp } = body;

      if (!email || !otp) {
        return NextResponse.json({ success: false, error: 'Email and 6-digit OTP code are required.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanOtp = otp.trim();

      const users = await sql`
        SELECT id, name, email, role, avatar, upi_id as "upiId",
               verification_otp as "verificationOtp",
               verification_expires_at as "verificationExpiresAt"
        FROM users
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;

      if (users.length === 0) {
        return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
      }

      const u = users[0];

      if (!u.verificationOtp || u.verificationOtp !== cleanOtp) {
        return NextResponse.json({ success: false, error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
      }

      if (u.verificationExpiresAt && new Date(u.verificationExpiresAt) < new Date()) {
        return NextResponse.json({ success: false, error: 'Verification code has expired. Please request a new code.' }, { status: 410 });
      }

      // Mark email as verified and clear OTP
      await sql`
        UPDATE users
        SET email_verified = TRUE,
            verification_otp = NULL,
            verification_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${u.id};
      `;

      const sessionUser: AuthSessionUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'traveler',
        avatar: u.avatar || '',
        upiId: u.upiId || '',
        emailVerified: true,
      };

      const sessionToken = await createSessionToken(sessionUser);
      const accessibleTrips = await getUserAccessibleTrips(sessionUser.id, sessionUser.email);

      const response = NextResponse.json({
        success: true,
        user: sessionUser,
        accessibleTrips,
        message: 'Email verified successfully!',
      });

      response.cookies.set({
        name: 'tulis_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // ----------------------------------------------------
    // Action: RESEND-OTP
    // ----------------------------------------------------
    if (action === 'resend-otp') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const users = await sql`
        SELECT id, name, email FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;

      if (users.length === 0) {
        return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
      }

      const u = users[0];
      const newOtp = generateNumericOtp();
      const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await sql`
        UPDATE users
        SET verification_otp = ${newOtp},
            verification_expires_at = ${newExpiresAt}
        WHERE id = ${u.id};
      `;

      const emailRes = await sendVerificationOtpEmail(cleanEmail, newOtp, u.name);
      if (!emailRes.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              emailRes.error ||
              'Could not dispatch verification email via Resend. Please check your email address.',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'A fresh 6-digit verification code has been dispatched via Resend.',
      });
    }

    // ----------------------------------------------------
    // Action: SEND-OTP (Passwordless Sign-In & Verification)
    // ----------------------------------------------------
    if (action === 'send-otp' || action === 'login-otp') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
      }

      const otp = generateNumericOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const users = await sql`
        SELECT id, name, email FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;

      let userName = 'Traveler';

      if (users.length > 0) {
        const u = users[0];
        userName = u.name || 'Traveler';
        await sql`
          UPDATE users
          SET verification_otp = ${otp},
              verification_expires_at = ${expiresAt}
          WHERE id = ${u.id};
        `;
      } else {
        const handle = cleanEmail.split('@')[0];
        userName = handle.charAt(0).toUpperCase() + handle.slice(1);
        const userId = 'u-' + Date.now();
        const defaultUpi = `${handle}@upi`;
        const tempHash = await hashPassword('password123');

        await sql`
          INSERT INTO users (id, name, email, password_hash, password, role, upi_id, email_verified, verification_otp, verification_expires_at)
          VALUES (
            ${userId},
            ${userName},
            ${cleanEmail},
            ${tempHash},
            'password123',
            'traveler',
            ${defaultUpi},
            FALSE,
            ${otp},
            ${expiresAt}
          );
        `;
      }

      const emailRes = await sendVerificationOtpEmail(cleanEmail, otp, userName);
      if (!emailRes.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              emailRes.error ||
              'Could not dispatch verification email via Resend. Please check your email address.',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        message: '6-digit verification code sent to your email via Resend.',
      });
    }

    // ----------------------------------------------------
    // Action: LOGIN
    // ----------------------------------------------------
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Look up user by email or ID
      const users = await sql`
        SELECT id, name, email, password, password_hash as "passwordHash",
               role, avatar, upi_id as "upiId", email_verified as "emailVerified"
        FROM users
        WHERE LOWER(email) = ${cleanEmail} OR id = ${email.trim()}
        LIMIT 1;
      `;

      let dbUser: any = users.length > 0 ? users[0] : null;

      // Fallback check demo users
      if (!dbUser) {
        const demo = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail
        );
        if (demo) dbUser = demo;
      }

      if (!dbUser) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const isPasswordValid = await verifyPassword(
        password,
        dbUser.passwordHash || dbUser.password_hash || dbUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. (Hint: Demo accounts use "password123")' },
          { status: 401 }
        );
      }

      const sessionUser: AuthSessionUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role || 'traveler',
        avatar: dbUser.avatar || '',
        upiId: dbUser.upiId || dbUser.upi_id || `${dbUser.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        emailVerified: Boolean(dbUser.emailVerified ?? dbUser.email_verified ?? true),
      };

      const sessionToken = await createSessionToken(sessionUser);
      const accessibleTrips = await getUserAccessibleTrips(sessionUser.id, sessionUser.email);

      const response = NextResponse.json({
        success: true,
        user: sessionUser,
        accessibleTrips,
        message: `Welcome back, ${sessionUser.name}!`,
      });

      response.cookies.set({
        name: 'tulis_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // ----------------------------------------------------
    // Action: CORPORATE-LOGIN (Dedicated Enterprise Authentication)
    // ----------------------------------------------------
    if (action === 'corporate-login') {
      const { email, password, companyDomain, companyName, costCenter, role = 'manager' } = body;

      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, error: 'A valid corporate work email is required.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const domain = companyDomain?.trim().toLowerCase().replace(/^@/, '') || cleanEmail.split('@')[1];
      const orgName = companyName?.trim() || domain.split('.')[0].toUpperCase() + ' Corporate';
      const cCenter = costCenter?.trim() || 'CC-GLOBAL-01';

      // 1. Find or create Organization in Neon
      let org: any = null;
      const existingOrgs = await sql`
        SELECT * FROM organizations 
        WHERE LOWER(domain) = ${domain} OR LOWER(email_domain) = ${domain}
        LIMIT 1;
      `;

      let orgId: string;
      if (existingOrgs.length > 0) {
        org = existingOrgs[0];
        orgId = org.id;
      } else {
        orgId = 'org-' + Date.now();
        await sql`
          INSERT INTO organizations (id, name, domain, email_domain, billing_tier, created_by)
          VALUES (${orgId}, ${orgName}, ${domain}, ${domain}, 'enterprise', 'corp-auth');
        `;
        org = { id: orgId, name: orgName, domain, email_domain: domain, billing_tier: 'enterprise' };

        // Seed default corporate policies
        const defaultPolicies = [
          { category: 'Food & Dining', daily_cap: 4500, requires_receipt: true, auto_approval_threshold: 2000 },
          { category: 'Accommodation', daily_cap: 12000, requires_receipt: true, auto_approval_threshold: 7000 },
          { category: 'Transportation', daily_cap: 3500, requires_receipt: true, auto_approval_threshold: 1500 },
          { category: 'Flight & Rail', daily_cap: 25000, requires_receipt: true, auto_approval_threshold: 15000 },
        ];
        for (const p of defaultPolicies) {
          const pid = 'pol-' + Math.random().toString(36).substring(2, 9);
          await sql`
            INSERT INTO expense_policies (id, organization_id, category, max_amount, daily_cap, requires_receipt, auto_approval_threshold, requires_approval_above)
            VALUES (${pid}, ${orgId}, ${p.category}, ${p.daily_cap}, ${p.daily_cap}, ${p.requires_receipt}, ${p.auto_approval_threshold}, ${p.auto_approval_threshold})
            ON CONFLICT DO NOTHING;
          `;
        }
      }

      // 2. Find or create User in users table
      const userRows = await sql`
        SELECT id, name, email, password_hash as "passwordHash", role, avatar, upi_id as "upiId"
        FROM users
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;

      let userId: string;
      let userName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      if (userRows.length > 0) {
        userId = userRows[0].id;
        userName = userRows[0].name || userName;
      } else {
        userId = 'u-corp-' + Date.now();
        const tempHash = await hashPassword(password || 'corporate123');
        await sql`
          INSERT INTO users (id, name, email, password_hash, password, role, email_verified, profile_completed)
          VALUES (${userId}, ${userName}, ${cleanEmail}, ${tempHash}, 'corporate123', 'corporate_manager', TRUE, TRUE);
        `;
      }

      // 3. Ensure membership in organization_members
      const memRows = await sql`
        SELECT * FROM organization_members
        WHERE organization_id = ${orgId} AND (user_id = ${userId} OR LOWER(email) = ${cleanEmail})
        LIMIT 1;
      `;

      if (memRows.length === 0) {
        await sql`
          INSERT INTO organization_members (id, organization_id, user_id, email, role, cost_center)
          VALUES (${'mem-' + Date.now()}, ${orgId}, ${userId}, ${cleanEmail}, ${role}, ${cCenter})
          ON CONFLICT DO NOTHING;
        `;
      }

      // 4. Construct Corporate Session User
      const sessionUser: AuthSessionUser = {
        id: userId,
        name: userName,
        email: cleanEmail,
        role: role === 'manager' ? 'corporate_manager' : 'corporate_employee',
        avatar: '',
        upiId: `${cleanEmail.split('@')[0]}@corp`,
        emailVerified: true,
        profileCompleted: true,
        isCorporate: true,
        organizationId: orgId,
        organizationName: org.name,
        organizationDomain: org.domain || domain,
        department: cCenter,
        costCenter: cCenter,
      };

      const sessionToken = await createSessionToken(sessionUser);

      const response = NextResponse.json({
        success: true,
        user: sessionUser,
        organization: org,
        message: `Authenticated successfully to ${org.name} Corporate Suite!`,
      });

      response.cookies.set({
        name: 'tulis_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // ----------------------------------------------------
    // Action: COMPLETE-PROFILE (Name, Gender, Mobile Number)
    // ----------------------------------------------------
    if (action === 'complete-profile') {
      const sessionUser = await getCurrentUser();
      const { userId, name, gender, phone, upiId } = body;
      const targetId = sessionUser?.id || userId;

      if (!targetId) {
        return NextResponse.json({ success: false, error: 'User authentication required.' }, { status: 401 });
      }

      if (!name?.trim() || !gender?.trim() || !phone?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Full name, gender, and mobile number are required.' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE users
        SET name = ${name.trim()},
            gender = ${gender.trim()},
            phone = ${phone.trim()},
            upi_id = COALESCE(${upiId?.trim() || null}, upi_id),
            profile_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${targetId};
      `;

      const updatedRows = await sql`
        SELECT id, name, email, role, avatar, upi_id as "upiId", email_verified as "emailVerified",
               gender, phone, profile_completed as "profileCompleted"
        FROM users
        WHERE id = ${targetId}
        LIMIT 1;
      `;

      if (updatedRows.length === 0) {
        return NextResponse.json({ success: false, error: 'User record not found.' }, { status: 404 });
      }

      const u = updatedRows[0];
      const updatedUser: AuthSessionUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'traveler',
        avatar: u.avatar || '',
        upiId: u.upiId || `${u.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        emailVerified: Boolean(u.emailVerified),
        gender: u.gender || undefined,
        phone: u.phone || undefined,
        profileCompleted: true,
      };

      const sessionToken = await createSessionToken(updatedUser);
      const accessibleTrips = await getUserAccessibleTrips(updatedUser.id, updatedUser.email);

      const response = NextResponse.json({
        success: true,
        user: updatedUser,
        accessibleTrips,
        message: 'Profile completed successfully!',
      });

      response.cookies.set({
        name: 'tulis_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // ----------------------------------------------------
    // Action: SWITCH (Demo Sandbox Account Switcher ONLY)
    // ----------------------------------------------------
    if (action === 'switch') {
      const { id, password } = body;
      const targetDemo = DEMO_USERS.find((u) => u.id === id);

      if (!targetDemo) {
        return NextResponse.json(
          { success: false, error: 'For privacy, only official demo accounts can be switched in this sandbox.' },
          { status: 403 }
        );
      }

      if (password !== 'password123') {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Demo password is "password123".' },
          { status: 401 }
        );
      }

      const sessionUser: AuthSessionUser = {
        id: targetDemo.id,
        name: targetDemo.name,
        email: targetDemo.email,
        role: targetDemo.role,
        avatar: targetDemo.avatar,
        upiId: targetDemo.upiId,
        emailVerified: true,
        profileCompleted: true,
      };

      const sessionToken = await createSessionToken(sessionUser);
      const accessibleTrips = await getUserAccessibleTrips(sessionUser.id, sessionUser.email);

      const response = NextResponse.json({
        success: true,
        user: sessionUser,
        accessibleTrips,
        message: `Authenticated as ${sessionUser.name}!`,
      });

      response.cookies.set({
        name: 'tulis_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    // ----------------------------------------------------
    // Action: LOGOUT
    // ----------------------------------------------------
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.delete('tulis_session');
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
