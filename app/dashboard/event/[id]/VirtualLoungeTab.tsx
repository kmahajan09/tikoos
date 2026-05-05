'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

type Section = 'chat' | 'videos' | 'photos' | 'polls'

export default function VirtualLoungeTab({ eventId, user, isHost, loungePrivacy }: {
  eventId: string, user: any, isHost: boolean, loungePrivacy: string
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [moodBoard, setMoodBoard] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [videoName, setVideoName] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoNote, setVideoNote] = useState('')
  const [addingVideo, setAddingVideo] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoLabel, setPhotoLabel] = useState('')
  const [addingPhoto, setAddingPhoto] = useState(false)
  const [newPollQ, setNewPollQ] = useState('')
  const [newPollOptions, setNewPollOptions] = useState(['', ''])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel(`lounge-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchAll = async () => {
    const [msgRes, pollRes, vidRes, photoRes] = await Promise.all([
      supabase.from('messages').select('*').eq('event_id', eventId).eq('channel', 'virtual_lounge').order('created_at', { ascending: true }),
      supabase.from('polls').select('*, poll_options(*)').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('video_messages').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('mood_board_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
    ])
    setMessages(msgRes.data || [])
    setPolls(pollRes.data || [])
    setVideos(vidRes.data || [])
    setMoodBoard(photoRes.data || [])
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    await supabase.from('messages').insert({
      event_id: eventId,
      channel: 'virtual_lounge',
      content: newMessage.trim(),
      sender_name: user?.email?.split('@')[0] || 'Guest',
      sender_role: 'host',
      user_id: user?.id,
    })
    setNewMessage('')
  }

  const addVideoWish = async () => {
    if (!videoName.trim() || !videoUrl.trim()) return alert('Please add your name and a video link')
    setAddingVideo(true)
    await supabase.from('video_messages').insert({
      event_id: eventId,
      sender_name: videoName.trim(),
      video_url: videoUrl.trim(),
      note: videoNote.trim(),
    })
    setVideoName(''); setVideoUrl(''); setVideoNote('')
    setAddingVideo(false)
    const { data } = await supabase.from('video_messages').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    setVideos(data || [])
  }

  const addPhoto = async () => {
    if (!photoUrl.trim()) return
    setAddingPhoto(true)
    await supabase.from('mood_board_items').insert({
      event_id: eventId,
      image_url: photoUrl.trim(),
      label: photoLabel.trim(),
    })
    setPhotoUrl(''); setPhotoLabel('')
    setAddingPhoto(false)
    const { data } = await supabase.from('mood_board_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    setMoodBoard(data || [])
  }

  const createPoll = async () => {
    if (!newPollQ.trim()) return
    const validOptions = newPollOptions.filter(o => o.trim())
    if (validOptions.length < 2) return alert('Add at least 2 options')
    const { data: poll } = await supabase.from('polls').insert({ event_id: eventId, question: newPollQ.trim() }).select().single()
    if (!poll) return
    await supabase.from('poll_options').insert(validOptions.map(o => ({ poll_id: poll.id, option_text: o.trim(), votes: 0 })))
    setNewPollQ(''); setNewPollOptions(['', ''])
    const { data } = await supabase.from('polls').select('*, poll_options(*)').eq('event_id', eventId).order('created_at', { ascending: false })
    setPolls(data || [])
  }

  const vote = async (optionId: string, currentVotes: number) => {
    await supabase.from('poll_options').update({ votes: currentVotes + 1 }).eq('id', optionId)
    const { data } = await supabase.from('polls').select('*, poll_options(*)').eq('event_id', eventId).order('created_at', { ascending: false })
    setPolls(data || [])
  }

  const getVideoEmbed = (url: string) => {
    if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/')
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
    if (url.includes('loom.com/share')) return url.replace('share', 'embed')
    return null
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const privateLock = (label: string) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3"
      style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
      <div className="text-3xl">🔒</div>
      <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{label} are private</p>
      <p className="text-xs" style={{ color: '#888780' }}>The host will share these during the celebration</p>
    </div>
  )

  const SECTIONS: { key: Section, label: string, emoji: string }[] = [
    { key: 'chat', label: 'Chat', emoji: '💬' },
    { key: 'videos', label: 'Video Wishes', emoji: '🎥' },
    { key: 'photos', label: 'Photos', emoji: '📸' },
    { key: 'polls', label: 'Polls', emoji: '📊' },
  ]

  if (loading) return <p style={{ color: '#888780' }}>Loading lounge...</p>

  const isPrivate = loungePrivacy === 'private' && !isHost

  return (
    <div className="flex flex-col gap-5">

      {/* Privacy banner for guests */}
      {isPrivate && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#EEEDFE' }}>
          <span>🔒</span>
          <p className="text-sm" style={{ color: '#3C3489' }}>
            This lounge is in private mode. You can submit content — the host will curate what gets shared.
          </p>
        </div>
      )}

      {/* Section toggle */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s.key}
            onClick={() => setActiveSection(s.key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeSection === s.key ? '#3C3489' : '#F5F4F0',
              color: activeSection === s.key ? '#fff' : '#5F5E5A',
            }}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* ── CHAT ── */}
      {activeSection === 'chat' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 h-96 overflow-y-auto px-1 py-2">
            {isPrivate && messages.length > 0 ? privateLock('Messages') :
              messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="text-4xl">💬</div>
                  <p className="text-sm" style={{ color: '#888780' }}>No messages yet — say hello!</p>
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
                        background: isMe ? '#3C3489' : '#F5F4F0',
                        color: isMe ? '#fff' : '#2C2C2A',
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                      }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-3">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Say something..."
              className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <button onClick={sendMessage} disabled={!newMessage.trim()}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: !newMessage.trim() ? '#D3D1C7' : '#D85A30' }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── VIDEO WISHES ── */}
      {activeSection === 'videos' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 p-5 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
            <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>🎥 Share a video wish</p>
            <p className="text-xs" style={{ color: '#888780' }}>
              Share a YouTube, Loom, or Vimeo link — perfect for birthday wishes from afar.
            </p>
            <input value={videoName} onChange={e => setVideoName(e.target.value)}
              placeholder="Your name"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              placeholder="Video link (YouTube, Loom, Vimeo)"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <textarea value={videoNote} onChange={e => setVideoNote(e.target.value)}
              placeholder="Add a personal message (optional)"
              rows={2}
              className="px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <button onClick={addVideoWish} disabled={addingVideo}
              className="text-white rounded-full py-3 text-sm font-medium transition-all hover:opacity-90"
              style={{ background: addingVideo ? '#D3D1C7' : '#D85A30' }}>
              {addingVideo ? 'Sharing...' : 'Share video wish →'}
            </button>
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3"
              style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
              <div className="text-3xl">🎥</div>
              <p className="text-sm" style={{ color: '#888780' }}>No video wishes yet — be the first!</p>
            </div>
          ) : isPrivate ? privateLock('Video wishes') : (
            <div className="flex flex-col gap-6">
              {videos.map(vid => {
                const embedUrl = getVideoEmbed(vid.video_url)
                return (
                  <div key={vid.id} className="flex flex-col gap-3 p-5 rounded-2xl border"
                    style={{ borderColor: '#D3D1C7' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ background: '#D85A30' }}>
                        {vid.sender_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{vid.sender_name}</p>
                        <p className="text-xs" style={{ color: '#B4B2A9' }}>{formatTime(vid.created_at)}</p>
                      </div>
                    </div>
                    {vid.note && <p className="text-sm italic" style={{ color: '#5F5E5A' }}>"{vid.note}"</p>}
                    {embedUrl ? (
                      <iframe src={embedUrl} className="w-full rounded-xl" height="280"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                    ) : (
                      <a href={vid.video_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm px-4 py-2 rounded-full border inline-flex items-center gap-2 w-fit hover:opacity-80"
                        style={{ color: '#3C3489', borderColor: '#AFA9EC' }}>
                        ▶ Watch video
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PHOTOS ── */}
      {activeSection === 'photos' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 p-5 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
            <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>📸 Share a photo</p>
            <p className="text-xs" style={{ color: '#888780' }}>Paste any image URL to add it to the celebration wall.</p>
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
              placeholder="Image URL (https://...)"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <input value={photoLabel} onChange={e => setPhotoLabel(e.target.value)}
              placeholder="Caption (optional)"
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            <button onClick={addPhoto} disabled={addingPhoto || !photoUrl.trim()}
              className="text-white rounded-full py-3 text-sm font-medium transition-all hover:opacity-90"
              style={{ background: addingPhoto || !photoUrl.trim() ? '#D3D1C7' : '#D85A30' }}>
              {addingPhoto ? 'Adding...' : 'Add photo →'}
            </button>
          </div>

          {moodBoard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3"
              style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
              <div className="text-3xl">📸</div>
              <p className="text-sm" style={{ color: '#888780' }}>No photos yet — share a memory!</p>
            </div>
          ) : isPrivate ? privateLock('Photos') : (
            <div className="grid grid-cols-2 gap-4">
              {moodBoard.map(photo => (
                <div key={photo.id} className="flex flex-col gap-2 rounded-2xl overflow-hidden border"
                  style={{ borderColor: '#D3D1C7' }}>
                  <img src={photo.image_url} alt={photo.label || 'Photo'}
                    className="w-full object-cover" style={{ height: 200 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  {photo.label && <p className="text-xs px-3 pb-3" style={{ color: '#5F5E5A' }}>{photo.label}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── POLLS ── */}
      {activeSection === 'polls' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 p-5 rounded-2xl border" style={{ borderColor: '#D3D1C7' }}>
            <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Create a poll</p>
            <input value={newPollQ} onChange={e => setNewPollQ(e.target.value)}
              placeholder="Ask a question..."
              className="px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            {newPollOptions.map((opt, i) => (
              <input key={i} value={opt}
                onChange={e => { const u = [...newPollOptions]; u[i] = e.target.value; setNewPollOptions(u) }}
                placeholder={`Option ${i + 1}`}
                className="px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }} />
            ))}
            <div className="flex gap-2">
              <button onClick={() => setNewPollOptions([...newPollOptions, ''])}
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{ color: '#3C3489', borderColor: '#AFA9EC' }}>
                + Add option
              </button>
              <button onClick={createPoll}
                className="text-xs px-4 py-1.5 rounded-full text-white hover:opacity-90"
                style={{ background: '#D85A30' }}>
                Create poll
              </button>
            </div>
          </div>

          {polls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3"
              style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
              <div className="text-3xl">📊</div>
              <p className="text-sm" style={{ color: '#888780' }}>No polls yet</p>
            </div>
          ) : isPrivate ? privateLock('Poll results') : (
            polls.map(poll => {
              const totalVotes = poll.poll_options?.reduce((s: number, o: any) => s + o.votes, 0) || 0
              return (
                <div key={poll.id} className="flex flex-col gap-3 p-5 rounded-2xl border"
                  style={{ borderColor: '#D3D1C7' }}>
                  <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{poll.question}</p>
                  {poll.poll_options?.map((opt: any) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
                    return (
                      <button key={opt.id} onClick={() => vote(opt.id, opt.votes)}
                        className="flex flex-col gap-1 text-left hover:opacity-80">
                        <div className="flex justify-between text-xs" style={{ color: '#5F5E5A' }}>
                          <span>{opt.option_text}</span>
                          <span>{opt.votes} votes · {pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: '#F5F4F0' }}>
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: '#7F77DD' }} />
                        </div>
                      </button>
                    )
                  })}
                  <p className="text-xs" style={{ color: '#B4B2A9' }}>{totalVotes} total votes</p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}