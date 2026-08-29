import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#12141C', color: '#E4E6F0' }}>
      <style>{`
        @keyframes blink { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes typeIn { from { width: 0 } to { width: 100% } }
        .cursor-a { animation: blink 1.8s step-end infinite; }
        .cursor-b { animation: blink 1.8s step-end infinite; animation-delay: 0.9s; }
        .line-1 { animation: typeIn 1.6s steps(28) forwards; }
        .line-2 { animation: typeIn 2.1s steps(40) forwards; animation-delay: 1.6s; }
        .line-3 { animation: typeIn 1.4s steps(24) forwards; animation-delay: 3.4s; }
        .line-1, .line-2, .line-3 { overflow: hidden; white-space: nowrap; width: 0; }
      `}</style>

      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }} className="text-xl">
          Cowrite
        </span>
        <div className="flex items-center gap-6" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Link href="/login" className="text-sm hover:opacity-70 transition-opacity">
            Log in
          </Link>
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#6C8EF5', color: '#12141C' }}
          >
            Start writing
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-8 pt-12 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, lineHeight: 1.05 }}
            className="text-5xl md:text-6xl mb-6"
          >
            Write together,
            <br />
            live.
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-lg mb-8 max-w-md">
            Every keystroke syncs instantly. Comment on any line, restore any version, and never wonder who changed what.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: '#6C8EF5', color: '#12141C', fontFamily: 'Inter, sans-serif' }}
          >
            Start writing — it&apos;s free
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #2A2E3D' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2A2E3D' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2A2E3D' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2A2E3D' }} />
            <span className="ml-3 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8B8FA3' }}>
              Product Roadmap.doc
            </span>
          </div>

          <div className="p-8 relative" style={{ minHeight: 260 }}>
            <p className="line-1 mb-4 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              Q3 launch checklist
            </p>
            <p className="line-2 mb-4 relative inline-block" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
              Finalize onboarding flow before the{' '}
              <span style={{ backgroundColor: '#FFB454', color: '#12141C', padding: '0 2px' }}>design review</span>
              <span className="cursor-a inline-block w-[2px] h-4 align-middle ml-0.5" style={{ backgroundColor: '#4ECDC4' }} />
            </p>
            <p className="line-3" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
              Sync with design team on
              <span className="cursor-b inline-block w-[2px] h-4 align-middle ml-1" style={{ backgroundColor: '#6C8EF5' }} />
            </p>

            <span
              className="absolute px-2 py-0.5 rounded text-[10px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', backgroundColor: '#4ECDC4', color: '#12141C', top: 92, left: 210 }}
            >
              Aditi
            </span>
            <span
              className="absolute px-2 py-0.5 rounded text-[10px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', backgroundColor: '#6C8EF5', color: '#12141C', top: 168, left: 130 }}
            >
              Rahul
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-10" style={{ borderTop: '1px solid #2A2E3D' }}>
        {[
          { title: 'Real-time editing', desc: 'See every collaborator\u2019s cursor and changes the instant they type.', color: '#6C8EF5' },
          { title: 'Comments on your text', desc: 'Select any passage and leave a comment right where it matters.', color: '#FFB454' },
          { title: 'Full version history', desc: 'Every save is kept. Jump back to any earlier version, anytime.', color: '#4ECDC4' },
        ].map((f) => (
          <div key={f.title}>
            <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: f.color }} />
            <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }} className="text-lg mb-2">
              {f.title}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      <footer className="max-w-6xl mx-auto px-8 py-8 text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
        Built with Next.js, Yjs, and Socket.IO.
      </footer>
    </main>
  )
}