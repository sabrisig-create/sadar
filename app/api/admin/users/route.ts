import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const adminAuth = request.cookies.get('admin_auth')?.value;

  if (adminAuth !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { data: reflections } = await supabase
    .from('reflections')
    .select('user_id');

  const reflectionCounts: { [key: string]: number } = {};
  reflections?.forEach((r) => {
    reflectionCounts[r.user_id] = (reflectionCounts[r.user_id] || 0) + 1;
  });

  const enrichedUsers = (users?.users || []).map((user) => ({
    id: user.id,
    email: user.email || 'No email',
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    reflection_count: reflectionCounts[user.id] || 0,
  }));

  return NextResponse.json(enrichedUsers);
}
