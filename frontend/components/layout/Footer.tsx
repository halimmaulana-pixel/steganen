export default function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold gradient-text">STEGONET</span>
          </div>

          <p className="text-xs text-dark-400">
            &copy; {new Date().getFullYear()} StegoNet &mdash; Skripsi Steganografi Berbasis Deep Learning
          </p>

          <div className="flex items-center gap-3 text-xs text-dark-500">
            <span>v1.0.0</span>
            <span className="w-1 h-1 rounded-full bg-dark-600" />
            <span>FastAPI + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
