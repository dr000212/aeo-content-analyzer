import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5 flex items-center">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-accent opacity-20 blur-sm" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Logo size={22} />
            </div>
          </div>

          {/* Brand Name */}
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-text-main">
                Search
              </span>
              <span className="text-xl font-extrabold tracking-tight gradient-text">
                EO
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
