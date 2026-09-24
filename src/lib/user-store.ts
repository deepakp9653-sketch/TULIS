// User & Authentication Store for FareShare
import { sql } from '@/lib/db';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // Stored password (demo accounts use 'password123')
  role: 'organizer' | 'traveler';
  avatar: string;
  upiId: string;
  accessibleTripIds: string[];
}

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'p1',
    name: 'Srushti Sharma',
    email: 'srushti@fareshare.in',
    password: 'password123',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    upiId: 'srushti.sharma@okicici',
    accessibleTripIds: ['trip-1', 'trip-2'],
  },
  {
    id: 'p2',
    name: 'Ananya Iyer',
    email: 'ananya@fareshare.in',
    password: 'password123',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    upiId: 'ananya.iyer@upi',
    accessibleTripIds: ['trip-1'],
  },
  {
    id: 'p3',
    name: 'Rohan Mehta',
    email: 'rohan@fareshare.in',
    password: 'password123',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    upiId: 'rohan.m@okhdfcbank',
    accessibleTripIds: ['trip-1'],
  },
  {
    id: 'p4',
    name: 'Priya Patel',
    email: 'priya@fareshare.in',
    password: 'password123',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    upiId: 'priyapatel@paytm',
    accessibleTripIds: ['trip-1'],
  },
  {
    id: 'p5',
    name: 'Diya Verma',
    email: 'diya@fareshare.in',
    password: 'password123',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=faces',
    upiId: 'diya.v@ybl',
    accessibleTripIds: ['trip-1'],
  },
  {
    id: 'p6',
    name: 'Kabir Roy',
    email: 'kabir@fareshare.in',
    password: 'password123',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    upiId: 'kabir.roy@postbank',
    accessibleTripIds: ['trip-1'],
  },
];

/**
 * Verify credentials against Neon database or in-memory fallback
 */
export async function authenticateUser(emailOrId: string, passwordAttempt: string): Promise<UserAccount | null> {
  const normalized = emailOrId.trim().toLowerCase();
  
  // Try querying Neon DB first
  try {
    const rows = await sql`
      SELECT id, name, email, password, role, avatar, upi_id as "upiId"
      FROM users
      WHERE LOWER(email) = ${normalized} OR id = ${emailOrId}
      LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      const dbUser = rows[0];
      if (dbUser.password === passwordAttempt) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          password: dbUser.password,
          role: dbUser.role || 'traveler',
          avatar: dbUser.avatar || '',
          upiId: dbUser.upiId || `${dbUser.name.toLowerCase().replace(/\s+/g, '')}@upi`,
          accessibleTripIds: ['trip-1'],
        };
      }
      return null; // Password mismatch
    }
  } catch (err) {
    console.warn('Neon auth query fallback to local demo users:', err);
  }

  // Fallback to local demo users
  const demo = DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      u.email.toLowerCase().replace('@grouptrip.in', '@fareshare.in') === normalized ||
      u.id.toLowerCase() === normalized
  );

  if (demo && demo.password === passwordAttempt) {
    return demo;
  }

  return null;
}

/**
 * Fetch all registered users
 */
export async function getAllUsers(): Promise<UserAccount[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, password, role, avatar, upi_id as "upiId"
      FROM users
      ORDER BY created_at ASC;
    `;
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        password: r.password,
        role: r.role || 'traveler',
        avatar: r.avatar || '',
        upiId: r.upiId || '',
        accessibleTripIds: ['trip-1'],
      }));
    }
  } catch (err) {
    console.warn('Neon getAllUsers fallback to local demo store:', err);
  }
  return DEMO_USERS;
}
