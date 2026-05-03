'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      fetchEvents(session.user.id)
    })
  }, [router])

  const fetchEvents = async (userId: string) => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p style={{ color: '#888780' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: '#D3D1C7' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: '#3C3489' }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M10 38L22 16L32 26L10 38Z" fill="white" opacity="0.95" />
              <path d="M22 16L32 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="34" cy="14" r="5" fill="#D85A30" />
            </svg>
          </div>
          <span className="text-xl font-medium" style={{ color: '#3C3489', letterSpacing: '-0.5px' }}>
            ti<span style={{ color: '#D85A30' }}>k</span><span style={{ color: '#D4537E' }}>oo</span>s
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#888780' }}>
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm px-4 py-2 rounded-full border transition-all hover:opacity-80"
            style={{ color: '#5F5E5A', borderColor: '#D3D1C7' }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Page title + create button */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-medium" style={{ color: '#2C2C2A', letterSpacing: '-0.5px' }}>
              Your Events
            </h1>
            <p className="text-sm mt-1" style={{ color: '#888780' }}>
              Plan, collaborate, celebrate.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/create')}
            className="text-white rounded-full px-6 py-3 text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#D85A30' }}>
            + New Event
          </button>
        </div>

        {/* Events list or empty state */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4"
            style={{ border: '1.5px dashed #D3D1C7', borderRadius: 20 }}>
            <div className="text-4xl">🎉</div>
            <p className="text-lg font-medium" style={{ color: '#2C2C2A' }}>No events yet</p>
            <p className="text-sm" style={{ color: '#888780' }}>Click "+ New Event" above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div key={event.id}
                className="flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-sm"
                style={{ borderColor: '#D3D1C7' }}
                onClick={() => router.push(`/dashboard/event/${event.id}`)}>
                <div>
                  <h2 className="text-lg font-medium" style={{ color: '#2C2C2A' }}>{event.title}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#888780' }}>
                    {event.event_date || 'Date TBD'} · {event.venue || 'Venue TBD'} · {event.guest_count} guests
                  </p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full"
                  style={{ background: '#EEEDFE', color: '#3C3489' }}>
                  {event.theme}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}