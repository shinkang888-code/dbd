/**
 * Rotating KSAC atom — the brand mark (nucleus + 3 orbits + electrons)
 * animated as a slowly spinning atom for the main banner. Decorative only.
 * Colors match the blue KSAC logo; reads well over the navy hero overlay.
 */
export function AtomSpinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="atom-core" cx="0.42" cy="0.38" r="0.72">
          <stop offset="0" stopColor="#d6ecfd" />
          <stop offset="0.5" stopColor="#4aa3ea" />
          <stop offset="1" stopColor="#1461bf" />
        </radialGradient>
        <linearGradient id="atom-orbit" x1="20" y1="40" x2="180" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e2f1fe" />
          <stop offset="1" stopColor="#7cc0f2" />
        </linearGradient>
        <filter id="atom-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ambient glow behind nucleus */}
      <circle cx="100" cy="100" r="34" fill="#4aa3ea" opacity="0.45" filter="url(#atom-glow)" />

      {/* spinning orbit + electron system */}
      <g
        className="origin-center animate-[spin_24s_linear_infinite] motion-reduce:animate-none"
        style={{ transformBox: "fill-box" }}
        stroke="url(#atom-orbit)"
        strokeWidth="2.4"
      >
        <ellipse cx="100" cy="100" rx="88" ry="30" />
        <ellipse cx="100" cy="100" rx="88" ry="30" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="88" ry="30" transform="rotate(120 100 100)" />
        <circle cx="188" cy="100" r="5.4" fill="#f2f9ff" />
        <circle cx="188" cy="100" r="5.4" fill="#a9d5f7" transform="rotate(60 100 100)" />
        <circle cx="188" cy="100" r="5.4" fill="#a9d5f7" transform="rotate(120 100 100)" />
      </g>

      {/* nucleus (static) */}
      <circle cx="100" cy="100" r="16" fill="url(#atom-core)" />
      <circle cx="94" cy="94" r="5" fill="#ffffff" fillOpacity="0.5" />
    </svg>
  );
}
