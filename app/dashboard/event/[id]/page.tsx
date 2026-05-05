'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import ChecklistTab from './ChecklistTab'
import VirtualLoungeTab from './VirtualLoungeTab'
import InvitesTab from './InvitesTab'


const TABS = ['Overview', 'Invites', 'Decor', 'Catering', 'DJ', 'Virtual Lounge', 'Checklist']



export default function EventPage() {
  const router = useRouter()
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      fetchEvent()
    })
  }, [id])

  const fetchEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    setEvent(data)
    setLoading(false)
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <p style={{ color: '#888780' }}>Loading event...</p>
    </main>
  )

  if (!event) return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <p style={{ color: '#888780' }}>Event not found.</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: '#D3D1C7' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')}
            className="text-sm px-4 py-2 rounded-full border transition-all hover:opacity-80"
            style={{ color: '#5F5E5A', borderColor: '#D3D1C7' }}>
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-medium" style={{ color: '#2C2C2A' }}>{event.title}</h1>
            <p className="text-xs" style={{ color: '#888780' }}>
              {event.event_date || 'Date TBD'} · {event.venue || 'Venue TBD'} · {event.guest_count} guests
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: '#EEEDFE', color: '#3C3489' }}>
          {event.theme}
        </span>
      </header>

      {/* Tabs */}
      <div className="flex gap-0 px-8 border-b overflow-x-auto"
        style={{ borderColor: '#D3D1C7' }}>
        {TABS.map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className="text-sm px-5 py-4 whitespace-nowrap transition-all"
            style={{
              color: activeTab === tab ? '#3C3489' : '#888780',
              borderBottom: activeTab === tab ? '2px solid #3C3489' : '2px solid transparent',
              fontWeight: activeTab === tab ? 500 : 400,
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-8 py-10">

        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Date', value: event.event_date || 'TBD' },
                { label: 'Venue', value: event.venue || 'TBD' },
                { label: 'Guests', value: event.guest_count || '0' },
                { label: 'Theme', value: event.theme },
                { label: 'Timezone', value: event.timezone },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-2xl border"
                  style={{ borderColor: '#D3D1C7' }}>
                  <p className="text-xs mb-1" style={{ color: '#888780' }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{item.value}</p>
                </div>
              ))}
            </div>
            {event.notes && (
              <div className="p-5 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
                <p className="text-xs mb-1" style={{ color: '#888780' }}>Notes</p>
                <p className="text-sm" style={{ color: '#2C2C2A' }}>{event.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Decor' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-4xl">🎨</div>
            <p className="text-lg font-medium" style={{ color: '#2C2C2A' }}>Decor tab</p>
            <p className="text-sm" style={{ color: '#888780' }}>Mood board and decor notes — coming soon</p>
          </div>
        )}

        {activeTab === 'Catering' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-4xl">🍽️</div>
            <p className="text-lg font-medium" style={{ color: '#2C2C2A' }}>Catering tab</p>
            <p className="text-sm" style={{ color: '#888780' }}>Menu builder with dietary tags — coming soon</p>
          </div>
        )}

        {activeTab === 'DJ' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-4xl">🎵</div>
            <p className="text-lg font-medium" style={{ color: '#2C2C2A' }}>DJ tab</p>
            <p className="text-sm" style={{ color: '#888780' }}>Song requests and voting — coming soon</p>
          </div>
        )}

        {activeTab === 'Virtual Lounge' && (
          <VirtualLoungeTab
            eventId={id as string}
            user={user}
            isHost={event.created_by === user?.id}
            loungePrivacy={event.lounge_privacy || 'public'}
          />
        )}

        {activeTab === 'Checklist' && (
          <ChecklistTab eventId={id as string} />
        )}

        {activeTab === 'Invites' && (
          <InvitesTab eventId={id as string} eventTitle={event.title} />
        )}


      </div>
    </main>
  )
}