export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-16 gap-10">

      {/* Badge */}
      <div className="text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full border"
        style={{ background: '#FAECE7', color: '#993C1D', borderColor: '#F0997B' }}>
        Built for celebrations
      </div>

      {/* Logo + wordmark */}
      <div className="flex flex-col items-center gap-3">

        {/* Icon */}
        <div className="flex items-center justify-center rounded-2xl"
          style={{ width: 80, height: 80, background: '#3C3489' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M10 38L22 16L32 26L10 38Z" fill="white" opacity="0.95" />
            <path d="M22 16L32 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="14" r="5" fill="#D85A30" />
            <line x1="34" y1="7" x2="34" y2="5" stroke="#D4537E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="9" x2="42" y2="7" stroke="#EF9F27" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="15" x2="43" y2="15" stroke="#D4537E" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="15" cy="32" r="2.5" fill="#EF9F27" opacity="0.7" />
            <rect x="28" y="32" width="5" height="5" rx="1.5" fill="#D4537E" opacity="0.8"
              transform="rotate(20 28 32)" />
            <circle cx="32" cy="36" r="2" fill="white" opacity="0.5" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="text-5xl font-medium tracking-tight" style={{ letterSpacing: '-2px' }}>
          <span style={{ color: '#3C3489' }}>ti</span>
          <span style={{ color: '#D85A30' }}>k</span>
          <span style={{ color: '#D4537E' }}>oo</span>
          <span style={{ color: '#3C3489' }}>s</span>
        </div>

        {/* Subline */}
        <p className="text-sm tracking-wide" style={{ color: '#888780' }}>
          your event · your people · one place
        </p>
      </div>

      {/* Tagline */}
      <p className="text-2xl font-medium text-center max-w-sm leading-snug" style={{ color: '#2C2C2A' }}>
        Every celebration deserves a{' '}
        <span style={{ color: '#D85A30' }}>command centre.</span>
      </p>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          className="text-white rounded-full px-9 py-4 text-base font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#3C3489' }}>
          Start planning →
        </button>
        <button
          className="rounded-full px-9 py-4 text-base font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ color: '#3C3489', border: '1.5px solid #AFA9EC', background: 'transparent' }}>
          See how it works
        </button>
      </div>

      {/* Feature strip */}
      <div className="flex rounded-2xl overflow-hidden" style={{ border: '1px solid #D3D1C7' }}>
        {[
          { title: 'Host', desc: 'Manage everything' },
          { title: 'Vendors', desc: 'All in sync' },
          { title: 'Guests', desc: 'Near & far' },
        ].map((f, i, arr) => (
          <div key={f.title}
            className="px-6 py-3.5 text-center text-sm"
            style={{
              borderRight: i < arr.length - 1 ? '1px solid #D3D1C7' : 'none',
              color: '#5F5E5A',
            }}>
            <p className="font-medium text-sm mb-0.5" style={{ color: '#2C2C2A' }}>{f.title}</p>
            {f.desc}
          </div>
        ))}
      </div>

      {/* Confetti dots */}
      <div className="flex gap-2 items-center">
        {[
          { bg: '#D85A30', round: false, rot: 20 },
          { bg: '#7F77DD', round: true,  rot: -10 },
          { bg: '#D4537E', round: false, rot: 35 },
          { bg: '#EF9F27', round: true,  rot: -25 },
          { bg: '#1D9E75', round: false, rot: 15 },
          { bg: '#D85A30', round: true,  rot: -30 },
          { bg: '#7F77DD', round: false, rot: 8 },
        ].map((dot, i) => (
          <div key={i}
            style={{
              width: dot.round ? 8 : 10,
              height: dot.round ? 8 : 10,
              background: dot.bg,
              borderRadius: dot.round ? '50%' : 3,
              transform: `rotate(${dot.rot}deg)`,
            }} />
        ))}
      </div>

    </main>
  )
}