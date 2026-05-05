'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function InvitesTab({ eventId, eventTitle }: { eventId: string, eventTitle: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [tokens, setTokens] = useState<any[]>([])
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [eventId])

  const fetchAll = async () => {
    const [membersRes, tokensRes] = await Promise.all([
      supabase.from('event_members').select('*').eq('event_id', eventId).order('joined_at', { ascending: false }),
      supabase.from('invite_tokens').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
    ])
    setMembers(membersRes.data || [])
    setTokens(tokensRes.data || [])
    setLoading(false)
  }

  const sendInvite = async () => {
    if (!guestName.trim()) return alert('Please enter a name')
    if (!guestEmail.trim() && !guestPhone.trim()) return alert('Please enter at least an email or phone number')
    setSending(true)

    const token = crypto.randomUUID()

    const { error } = await supabase.from('invite_tokens').insert({
      event_id: eventId,
      role: 'guest',
      token,
      used: false,
    })

    if (error) {
      alert('Error generating invite: ' + error.message)
      setSending(false)
      return
    }

    const inviteUrl = `${window.location.origin}/invite/${token}`
    await navigator.clipboard.writeText(inviteUrl)
    alert(`✅ Invite link copied for ${guestName}!\n\nShare it via WhatsApp, iMessage, or email.`)

    setGuestName('')
    setGuestEmail('')
    setGuestPhone('')
    setSending(false)
    fetchAll()
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (loading) return <p style={{ color: '#888780' }}>Loading invites...</p>

  return (
    <div className="flex flex-col gap-8">

      {/* Send invite form */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>📨 Create an invite</p>
          <p className="text-xs mt-1" style={{ color: '#888780' }}>
            Enter guest details — we'll generate a unique link you can share via WhatsApp, iMessage, or email.
          </p>
        </div>
        <input value={guestName} onChange={e => setGuestName(e.target.value)}
          placeholder="Guest name *"
          className="px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
        <div className="flex gap-3">
          <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
            placeholder="Email (optional)"
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
          <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
        </div>
        <p className="text-xs" style={{ color: '#B4B2A9' }}>
          Enter email, phone, or both — at least one is required.
        </p>
        <button onClick={sendInvite} disabled={sending}
          className="text-white rounded-full py-3 text-sm font-medium transition-all hover:opacity-90"
          style={{ background: sending ? '#D3D1C7' : '#D85A30' }}>
          {sending ? 'Generating...' : 'Generate & Copy Invite Link →'}
        </button>
      </div>

      {/* Sent invites */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>
          Sent Invites ({tokens.length})
        </p>
        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3"
            style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
            <div className="text-3xl">📨</div>
            <p className="text-sm" style={{ color: '#888780' }}>No invites yet</p>
          </div>
        ) : (
          tokens.map(t => (
            <div key={t.id}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border"
              style={{ borderColor: '#D3D1C7' }}>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: t.used ? '#E6F7F1' : '#FEF0E6',
                    color: t.used ? '#1D9E75' : '#D85A30'
                  }}>
                  {t.used ? '✓ RSVPd' : 'Pending'}
                </span>
                <span className="text-xs" style={{ color: '#888780' }}>
                  Expires {new Date(t.expires_at).toLocaleDateString()}
                </span>
              </div>
              <button onClick={() => copyLink(t.token)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
                style={{ color: '#3C3489', borderColor: '#AFA9EC' }}>
                {copiedToken === t.token ? '✓ Copied!' : 'Copy link'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Guest list */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>
          Guest List ({members.length} RSVPs)
        </p>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3"
            style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
            <div className="text-3xl">👥</div>
            <p className="text-sm" style={{ color: '#888780' }}>No RSVPs yet</p>
          </div>
        ) : (
          members.map(m => (
            <div key={m.id}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border"
              style={{ borderColor: '#D3D1C7' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ background: '#3C3489' }}>
                  {m.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{m.name || 'Unknown'}</p>
                  {m.email && <p className="text-xs" style={{ color: '#888780' }}>{m.email}</p>}
                  {m.phone && <p className="text-xs" style={{ color: '#888780' }}>📱 {m.phone}</p>}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: '#E6F7F1', color: '#1D9E75' }}>
                ✓ Going
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  )
}