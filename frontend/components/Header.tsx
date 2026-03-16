export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5 flex items-center">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-blue-400 to-accent opacity-20 blur-sm" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <path d="M12 6a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M2 12a10 10 0 0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-text-main">
                AEO
              </span>
              <span className="text-xl font-extrabold tracking-tight text-primary">
                Lens
              </span>
            </div>
            <p className="text-[11px] text-text-dim tracking-wide">
              Find out how search engines and AI see your page
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
