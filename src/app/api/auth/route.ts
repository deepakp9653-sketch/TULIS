import { NextResponse } from 'next/server';
import { authenticateUser, getAllUsers, DEMO_USERS } from '@/lib/user-store';

export async function GET() {
  try {
    const users = await getAllUsers();
    // Return sanitized users (keep password for demo accounts so user can see it in UI)
    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        upiId: u.upiId,
        demoPassword: u.password,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, id, password } = body;

    if (action === 'login' || action === 'switch') {
      const target = email || id;
      if (!target || !password) {
        return NextResponse.json(
          { success: false, message: 'Email/ID and password are required.' },
          { status: 400 }
        );
      }

      const user = await authenticateUser(target, password);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid password. (Hint: Demo accounts use "password123")',
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          upiId: user.upiId,
          accessibleTripIds: user.accessibleTripIds,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
