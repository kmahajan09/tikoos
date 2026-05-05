'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function InvitePage() {
  const { token } = useParams()
  const [invite, setInvite] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rsvp, setRsvp] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { fetchInvite() }, [token])

  const fetchInvite = async () => {
    const { data: inviteData } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (!inviteData) { setLoading(false); return }
    setInvite(inviteData)

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', inviteData.event_id)
      .single()

    setEvent(eventData)
    setLoading(false)
  }

  const handleRSVP = async (response: string) => {
    if (!name.trim()) return alert('Please enter your name')
    setSubmitting(true)
    setRsvp(response)

    await supabase.from('event_members').insert({
      event_id: invite.event_id,
      name: name.trim(),
      role: 'guest',
      email: '',
      phone: phone.trim(),
    })

    await supabase.from('invite_tokens')
      .update({ used: true })
      .eq('token', token)

    setSubmitting(false)
    setDone(true)
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <p style={{ color: '#888780' }}>Loading invite...</p>
    </main>
  )

  if (!invite || !event) return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center flex flex-col gap-3">
        <p className="text-lg font-medium" style={{ color: '#2C2C2A' }}>Invite not found</p>
        <p className="text-sm" style={{ color: '#888780' }}>This link may have expired or already been used.</p>
      </div>
    </main>
  )

  if (done) return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="text-5xl">{rsvp === 'yes' ? '🎉' : '💌'}</div>
        <h1 className="text-2xl font-medium" style={{ color: '#2C2C2A' }}>
          {rsvp === 'yes' ? "You're going!" : "Thanks for letting us know"}
        </h1>
        <p className="text-sm max-w-xs" style={{ color: '#888780' }}>
          {rsvp === 'yes'
            ? `See you at ${event.title}! The host will share more details soon.`
            : `We'll miss you at ${event.title}. Thanks for responding!`}
        </p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Logo */}
        <div className="text-center">
          <span className="text-2xl font-medium" style={{ letterSpacing: '-1px' }}>
            <span style={{ color: '#3C3489' }}>ti</span>
            <span style={{ color: '#D85A30' }}>k</span>
            <span style={{ color: '#D4537E' }}>oo</span>
            <span style={{ color: '#3C3489' }}>s</span>
          </span>
        </div>

        {/* Invite card */}
        <div className="flex flex-col gap-6 p-8 rounded-3xl border"
          style={{ borderColor: '#D3D1C7' }}>

          <div className="text-center flex flex-col gap-2">
            <div className="text-4xl">🎉</div>
            <h1 className="text-2xl font-medium" style={{ color: '#2C2C2A' }}>
              You're invited!
            </h1>
            <p className="text-lg font-medium" style={{ color: '#D85A30' }}>
              {event.title}
            </p>
            {event.subtitle && (
              <p className="text-sm" style={{ color: '#888780' }}>{event.subtitle}</p>
            )}
          </div>

          {/* Event details */}
          <div className="flex flex-col gap-2">
            {event.event_date && (
              <div className="flex gap-3 text-sm">
                <span>📅</span>
                <span style={{ color: '#2C2C2A' }}>{event.event_date}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex gap-3 text-sm">
                <span>📍</span>
                <span style={{ color: '#2C2C2A' }}>{event.venue}</span>
              </div>
            )}
            {event.theme && (
              <div className="flex gap-3 text-sm">
                <span>✨</span>
                <span style={{ color: '#2C2C2A' }}>{event.theme}</span>
              </div>
            )}
          </div>

          {/* RSVP form */}
          <div className="flex flex-col gap-3">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name *"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <div className="flex gap-3">
              <button onClick={() => handleRSVP('yes')} disabled={submitting}
                className="flex-1 py-3 rounded-full text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ background: '#1D9E75' }}>
                ✓ Yes, I'll be there!
              </button>
              <button onClick={() => handleRSVP('no')} disabled={submitting}
                className="flex-1 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{ color: '#5F5E5A', border: '1.5px solid #D3D1C7' }}>
                Can't make it
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}