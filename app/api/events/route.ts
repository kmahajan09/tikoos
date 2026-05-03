import { NextResponse } from 'next/server'
import { createServerSupabase } from '../../../lib/supabase/server'

type Body = {
  title: string
  subtitle?: string
  event_date?: string | null
  venue?: string
  guest_count?: number
  theme?: string
  timezone?: string
  notes?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated', hint: 'Sign out, sign in again, then retry.' },
      { status: 401 },
    )
  }

  const { data, error } = await supabase
    .rpc('insert_event', {
      p_title: body.title.trim(),
      p_subtitle: body.subtitle ?? '',
      p_event_date: body.event_date ?? '',
      p_venue: body.venue ?? '',
      p_guest_count: Number.isFinite(body.guest_count) ? Number(body.guest_count) : 0,
      p_theme: body.theme ?? 'Garden Enchantment',
      p_timezone: body.timezone ?? 'America/New_York',
      p_notes: body.notes ?? '',
    })
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      { status: 422 },
    )
  }

  return NextResponse.json({ data })
}
