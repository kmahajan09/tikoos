'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function CreateEvent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    event_date: '',
    venue: '',
    guest_count: '',
    theme: 'Garden Enchantment',
    timezone: 'America/New_York',
    notes: '',
    lounge_privacy: 'public',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUserId(session.user.id)
    })
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.title) return alert('Please add an event name')
    setLoading(true)

    const { error } = await supabase.from('events').insert({
      title: form.title,
      subtitle: form.subtitle,
      event_date: form.event_date || null,
      venue: form.venue,
      guest_count: parseInt(form.guest_count) || 0,
      theme: form.theme,
      timezone: form.timezone,
      notes: form.notes,
      lounge_privacy: form.lounge_privacy,
      created_by: userId,
    })

    setLoading(false)
    if (error) { alert('Error creating event: ' + error.message); return }
    router.push('/dashboard')
  }

  const themes = [
    'Garden Enchantment', 'Golden Hour', 'Midnight Glam',
    'Tropical Fiesta', 'Winter Wonderland', 'Rustic Charm',
    'Bollywood Nights', 'Modern Minimalist', 'Floral Fantasy'
  ]

  const field = (label: string, name: string, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={(form as any)[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl border text-sm outline-none transition-all"
        style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}
      />
    </div>
  )

  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-5 border-b" style={{ borderColor: '#D3D1C7' }}>
        <button onClick={() => router.push('/dashboard')}
          className="text-sm px-4 py-2 rounded-full border transition-all hover:opacity-80"
          style={{ color: '#5F5E5A', borderColor: '#D3D1C7' }}>
          ← Back
        </button>
        <h1 className="text-lg font-medium" style={{ color: '#2C2C2A' }}>Create New Event</h1>
      </header>

      {/* Form */}
      <div className="max-w-xl mx-auto px-8 py-12 flex flex-col gap-6">

        {field('Event Name *', 'title', 'text', "Priya's 30th Birthday")}
        {field('Subtitle', 'subtitle', 'text', 'A night to remember')}
        {field('Date', 'event_date', 'date')}
        {field('Venue', 'venue', 'text', 'The Grand Ballroom, Mumbai')}
        {field('Guest Count', 'guest_count', 'number', '80')}

        {/* Theme picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Theme</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <button key={t} onClick={() => setForm({ ...form, theme: t })}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  borderColor: form.theme === t ? '#3C3489' : '#D3D1C7',
                  background: form.theme === t ? '#EEEDFE' : 'transparent',
                  color: form.theme === t ? '#3C3489' : '#5F5E5A',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Timezone</label>
          <select name="timezone" value={form.timezone} onChange={handleChange}
            className="px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}>
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="America/Toronto">Toronto (ET)</option>
            <option value="America/Vancouver">Vancouver (PT)</option>
            <option value="Asia/Kolkata">India (IST)</option>
          </select>
        </div>

        {/* Lounge Privacy */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>
            Virtual Lounge Privacy
          </label>
          <p className="text-xs" style={{ color: '#888780' }}>
            Private mode hides guest submissions from each other — only the host sees everything.
          </p>
          <div className="flex gap-3">
            {[
              { value: 'public', label: '🌐 Public', desc: 'Everyone sees all messages and videos' },
              { value: 'private', label: '🔒 Private', desc: 'Only host sees submissions' },
            ].map(opt => (
              <button key={opt.value}
                onClick={() => setForm({ ...form, lounge_privacy: opt.value })}
                className="flex-1 flex flex-col gap-1 p-4 rounded-xl border text-left transition-all"
                style={{
                  borderColor: form.lounge_privacy === opt.value ? '#3C3489' : '#D3D1C7',
                  background: form.lounge_privacy === opt.value ? '#EEEDFE' : 'transparent',
                }}>
                <span className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{opt.label}</span>
                <span className="text-xs" style={{ color: '#888780' }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            placeholder="Any special instructions or details..."
            rows={3}
            className="px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          className="text-white rounded-full py-4 text-sm font-medium transition-all hover:opacity-90 active:scale-95 mt-2"
          style={{ background: loading ? '#888780' : '#D85A30' }}>
          {loading ? 'Creating...' : 'Create Event →'}
        </button>

      </div>
    </main>
  )
}