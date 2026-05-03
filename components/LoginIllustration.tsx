export function LoginIllustration() {
  return (
    <div className="relative h-[280px] w-[230px] overflow-hidden rounded-[42%] border border-white/70 bg-[radial-gradient(circle_at_top,#fbf7ff,#e8dcf6_48%,#b79bd4_100%)] shadow-[0_28px_70px_rgba(120,84,162,0.24)]">
      <svg viewBox="0 0 260 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hair-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#5d3628" />
            <stop offset="100%" stopColor="#2e1b16" />
          </linearGradient>
          <linearGradient id="shirt-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8b63b1" />
            <stop offset="100%" stopColor="#5f3f86" />
          </linearGradient>
        </defs>

        <circle cx="207" cy="72" r="34" fill="#ffffff" fillOpacity="0.42" />
        <circle cx="58" cy="80" r="22" fill="#f6f0ff" fillOpacity="0.82" />
        <circle cx="196" cy="244" r="62" fill="#d8b27b" fillOpacity="0.32" />

        <path
          d="M78 121C84 71 130 43 172 53C211 62 232 104 219 157C209 195 192 225 171 233C116 256 61 207 78 121Z"
          fill="url(#hair-gradient)"
        />
        <path
          d="M93 122C98 87 122 72 146 72C174 72 193 94 193 126C193 158 177 188 145 194C109 201 88 165 93 122Z"
          fill="#f3c5a2"
        />
        <path
          d="M86 131C88 86 116 60 150 60C185 60 210 89 209 136C208 175 196 199 176 215C171 182 146 168 119 160C101 155 91 146 86 131Z"
          fill="url(#hair-gradient)"
        />
        <path
          d="M127 160C135 166 145 166 153 160"
          stroke="#9c5a3c"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <ellipse cx="121" cy="140" rx="5" ry="6" fill="#3a2a24" />
        <ellipse cx="161" cy="140" rx="5" ry="6" fill="#3a2a24" />
        <path
          d="M142 146C139 153 137 160 138 167C142 169 146 169 150 167"
          stroke="#b87f61"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.4"
        />
        <path
          d="M122 112C127 108 135 107 141 110"
          stroke="#2e1b16"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M149 110C154 107 162 108 167 112"
          stroke="#2e1b16"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M131 190H153V214C153 225 148 231 142 231C136 231 131 225 131 214V190Z"
          fill="#efba96"
        />
        <path
          d="M84 295C93 243 114 220 142 220C169 220 193 243 202 295H84Z"
          fill="url(#shirt-gradient)"
        />
        <path
          d="M102 295C110 259 123 239 141 239C159 239 173 259 181 295H102Z"
          fill="#9f7ec0"
          fillOpacity="0.72"
        />
        <path
          d="M89 150C84 179 87 207 102 224C88 213 71 191 71 165C71 142 81 121 97 108"
          fill="url(#hair-gradient)"
        />
        <path
          d="M193 149C198 178 195 207 180 224C194 213 211 191 211 165C211 142 201 121 185 108"
          fill="url(#hair-gradient)"
        />
      </svg>

      <div className="absolute right-4 top-4 rounded-full bg-white/88 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7854a2] shadow-[0_12px_24px_rgba(31,35,43,0.08)]">
        visual proprio
      </div>
    </div>
  );
}
