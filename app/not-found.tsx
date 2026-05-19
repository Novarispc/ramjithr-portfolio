import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#00ff87]/4 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-6">404 · Not Found</p>

        <h1
          className="text-[8rem] sm:text-[12rem] font-black leading-none tracking-tight mb-4"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        <h2 className="text-white text-2xl sm:text-3xl font-black mb-3">Page not found</h2>
        <p className="text-[#a3a3a3] text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          This route doesn&apos;t exist. Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{ backgroundColor: '#00ff87', color: '#080808' }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
