'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const ROLES = ['host', 'decorator', 'caterer', 'dj', 'organizer', 'all']

export default function ChecklistTab({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newRole, setNewRole] = useState('all')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [eventId])

  const fetchItems = async () => {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  const addItem = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        event_id: eventId,
        title: newTitle.trim(),
        assigned_role: newRole,
        completed: false,
      })
      .select()
      .single()
    if (!error && data) setItems([...items, data])
    setNewTitle('')
    setNewRole('all')
    setAdding(false)
  }

  const toggleItem = async (item: any) => {
    const { data, error } = await supabase
      .from('checklist_items')
      .update({ completed: !item.completed })
      .eq('id', item.id)
      .select()
      .single()
    if (!error && data) {
      setItems(items.map(i => i.id === item.id ? data : i))
    }
  }

  const deleteItem = async (id: string) => {
    await supabase.from('checklist_items').delete().eq('id', id)
    setItems(items.filter(i => i.id !== id))
  }

  const roleColor = (role: string) => {
    const colors: any = {
      host: { bg: '#EEEDFE', color: '#3C3489' },
      decorator: { bg: '#FDE8F0', color: '#D4537E' },
      caterer: { bg: '#FEF0E6', color: '#D85A30' },
      dj: { bg: '#E6F7F1', color: '#1D9E75' },
      organizer: { bg: '#FEF9E6', color: '#D4A017' },
      all: { bg: '#F5F4F0', color: '#5F5E5A' },
    }
    return colors[role] || colors.all
  }

  const completed = items.filter(i => i.completed).length
  const total = items.length

  if (loading) return <p style={{ color: '#888780' }}>Loading checklist...</p>

  return (
    <div className="flex flex-col gap-6">

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#2C2C2A', fontWeight: 500 }}>{completed} of {total} done</span>
            <span style={{ color: '#888780' }}>{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: '#F5F4F0' }}>
            <div className="h-2 rounded-full transition-all"
              style={{
                width: `${(completed / total) * 100}%`,
                background: completed === total ? '#1D9E75' : '#3C3489'
              }} />
          </div>
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-3 items-end">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>New task</label>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="e.g. Confirm catering menu"
            className="px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#2C2C2A' }}>Assign to</label>
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}>
            {ROLES.map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          onClick={addItem}
          disabled={adding || !newTitle.trim()}
          className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: adding || !newTitle.trim() ? '#D3D1C7' : '#D85A30' }}>
          Add
        </button>
      </div>

      {/* Checklist items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3"
          style={{ border: '1.5px dashed #D3D1C7', borderRadius: 16 }}>
          <div className="text-3xl">✅</div>
          <p className="text-sm" style={{ color: '#888780' }}>No tasks yet — add one above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all"
              style={{
                borderColor: '#D3D1C7',
                background: item.completed ? '#F9F9F7' : '#fff',
              }}>

              {/* Checkbox */}
              <button
                onClick={() => toggleItem(item)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: item.completed ? '#1D9E75' : '#D3D1C7',
                  background: item.completed ? '#1D9E75' : 'transparent',
                }}>
                {item.completed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Title */}
              <p className="flex-1 text-sm"
                style={{
                  color: item.completed ? '#B4B2A9' : '#2C2C2A',
                  textDecoration: item.completed ? 'line-through' : 'none',
                }}>
                {item.title}
              </p>

              {/* Role badge */}
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={roleColor(item.assigned_role)}>
                {item.assigned_role}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteItem(item.id)}
                className="text-xs transition-all hover:opacity-60"
                style={{ color: '#B4B2A9' }}>
                ✕
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}