import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { clerkSecretKey } = await req.json();
    if (!clerkSecretKey) {
      return NextResponse.json({ error: 'Missing Clerk secret key' }, { status: 400 });
    }
    // Fetch all users (paginated, but for demo just first 100)
    const usersRes = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!usersRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch users from Clerk' }, { status: 500 });
    }
    const users = await usersRes.json();
    const totalUsers = users.length || users.data?.length || 0;
    // Created today
    const today = new Date();
    today.setHours(0,0,0,0);
    const createdToday = (users.data || users).filter((u: any) => new Date(u.created_at) >= today).length;
    // Active users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const activeUsers = (users.data || users).filter((u: any) => new Date(u.last_sign_in_at) >= weekAgo).length;
    return NextResponse.json({
      totalUsers,
      createdToday,
      activeUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}