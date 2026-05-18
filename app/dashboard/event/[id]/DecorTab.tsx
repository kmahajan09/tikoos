'use client'


import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function DecorTab({ eventId }: { eventId: string }) {
  const [moodBoard, setMoodBoard] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'moodboard' | 'notes'>('moodboard')
  const [imageUrl, setImageUrl] = useState('')
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('')
  const [adding, setAdding] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<any>(null)

  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user)
    })
    fetchAll()

    const channel = supabase
      .channel(`decor-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        if ((payload.new as any).channel === 'decor_notes') {
          setMessages(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const fetchAll = async () => {
    const [moodRes, notesRes] = await Promise.all([
      supabase.from('mood_board_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('event_id', eventId).eq('channel', 'decor_notes').order('created_at', { ascending: true }),
    ])
    setMoodBoard(moodRes.data || [])
    setMessages(notesRes.data || [])
    setLoading(false)
  }

  const addMoodItem = async () => {
    if (!imageUrl.trim() && !emoji.trim()) return alert('Add an image URL or an emoji')
    setAdding(true)
    await supabase.from('mood_board_items').insert({
      event_id: eventId,
      image_url: imageUrl.trim() || null,
      emoji: emoji.trim() || null,
      label: label.trim() || null,
    })
    setImageUrl(''); setLabel(''); setEmoji('')
    setAdding(false)
    const { data } = await supabase.from('mood_board_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    setMoodBoard(data || [])
  }

  const deleteMoodItem = async (id: string) => {
    await supabase.from('mood_board_items').delete().eq('id', id)
    setMoodBoard(moodBoard.filter(m => m.id !== id))
  }

  const sendNote = async () => {
    if (!newNote.trim()) return
    setSending(true)
    await supabase.from('messages').insert({
      event_id: eventId,
      channel: 'decor_notes',
      content: newNote.trim(),
      sender_name: user?.email?.split('@')[0] || 'Host',
      sender_role: 'decorator',
      user_id: user?.id,
    })
    setNewNote('')
    setSending(false)
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (loading) return <p style={{ color: '#888780' }}>Loading decor...</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Section toggle */}
      <div className="flex gap-2">
        {[
          { key: 'moodboard', label: '🎨 Mood Board' },
          { key: 'notes', label: '💬 Decor Notes' },
        ].map(s => (
          <button key={s.key}
            onClick={() => setActiveSection(s.key as any)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeSection === s.key ? '#3C3489' : '#F5F4F0',
              color: activeSection === s.key ? '#fff' : '#5F5E5A',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── MOOD BOARD ── */}
      {activeSection === 'moodboard' && (
        <div className="flex flex-col gap-6">

          {/* Add item form */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
            <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Add to mood board</p>
            <p className="text-xs" style={{ color: '#888780' }}>
              Add an image URL for photos, or just an emoji for colour/vibe references.
            </p>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="Image URL (https://...)"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <div className="flex gap-3">
              <input value={emoji} onChange={e => setEmoji(e.target.value)}
                placeholder="Emoji (e.g. 🌸)"
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
              <input value={label} onChange={e => setLabel(e.target.value)}
                placeholder="Label (e.g. Floral theme)"
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            </div>
            <button onClick={addMoodItem} disabled={adding}
              className="text-white rounded-full py-3 text-sm font-medium transition-all hover:opacity-90"
              style={{ background: adding ? '#D3D1C7' : '#D85A30' }}>
              {adding ? 'Adding...' : 'Add to board →'}
            </button>
          </div>

          {/* Mood board grid */}
          {moodBoard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3"
              style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
              <div className="text-4xl">🎨</div>
              <p className="text-sm" style={{ color: '#888780' }}>No mood board items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {moodBoard.map(item => (
                <div key={item.id}
                  className="relative flex flex-col rounded-2xl overflow-hidden border group"
                  style={{ borderColor: '#D3D1C7' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.label || ''}
                      className="w-full object-cover" style={{ height: 140 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : item.emoji ? (
                    <div className="flex items-center justify-center"
                      style={{ height: 140, background: '#F5F4F0' }}>
                      <span style={{ fontSize: 48 }}>{item.emoji}</span>
                    </div>
                  ) : null}
                  {item.label && (
                    <p className="text-xs px-3 py-2" style={{ color: '#5F5E5A' }}>{item.label}</p>
                  )}
                  <button
                    onClick={() => deleteMoodItem(item.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 10 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DECOR NOTES ── */}
      {activeSection === 'notes' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs" style={{ color: '#888780' }}>
            Private notes between host and decorator — coordinate colours, layouts, and ideas here.
          </p>

          {/* Messages */}
          <div className="flex flex-col gap-2 h-96 overflow-y-auto px-1 py-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="text-4xl">💬</div>
                <p className="text-sm" style={{ color: '#888780' }}>No notes yet — start the conversation</p>
              </div>
            ) : messages.map(msg => {
              const isMe = msg.user_id === user?.id
              return (
                <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: '#888780' }}>{msg.sender_name}</span>
                    <span className="text-xs" style={{ color: '#B4B2A9' }}>{formatTime(msg.created_at)}</span>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl max-w-xs text-sm"
                    style={{
                      background: isMe ? '#D4537E' : '#F5F4F0',
                      color: isMe ? '#fff' : '#2C2C2A',
                      borderBottomRightRadius: isMe ? 4 : 16,
                      borderBottomLeftRadius: isMe ? 16 : 4,
                    }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input value={newNote} onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendNote()}
              placeholder="Add a decor note..."
              className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <button onClick={sendNote} disabled={sending || !newNote.trim()}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: sending || !newNote.trim() ? '#D3D1C7' : '#D4537E' }}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}