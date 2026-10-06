import React from 'react';

interface FitoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'text';
  className?: string;
  showBadge?: boolean;
}

/**
 * FITORA Modern Fitness-Tech Logo
 * Symbol: Kinetic abstract 'F' energy chevron representing human momentum, progressive growth & performance
 * Wordmark: Modern geometric typography with high-energy athletic accent
 */
export const FitoraLogo: React.FC<FitoraLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showBadge = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  // SVG Kinetic Energy Mark
  const LogoMark = (
    <div
      className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#122438] via-[#0b1726] to-[#040c18] p-1.5 flex items-center justify-center border border-[#4edea3]/40 shadow-lg shadow-[#4edea3]/15 shrink-0 group-hover:border-[#4edea3] transition-all`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(78,222,163,0.5)]"
      >
        <defs>
          <linearGradient id="fitoraGradPrimary" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4edea3" />
            <stop offset="65%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#9ddf2e" />
          </linearGradient>
          <linearGradient id="fitoraGradAccent" x1="12" y1="8" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9ddf2e" />
            <stop offset="100%" stopColor="#4edea3" />
          </linearGradient>
        </defs>

        {/* Back kinetic motion wing / shadow bar */}
        <path
          d="M8 32L14 32L26 8L20 8L8 32Z"
          fill="url(#fitoraGradPrimary)"
          fillOpacity="0.3"
        />

        {/* Dynamic Forward Energy Stem ('F' spine + upward forward motion) */}
        <path
          d="M13 32L19 32L28 14L22 14L13 32Z"
          fill="url(#fitoraGradPrimary)"
        />

        {/* Top Horizontal Momentum Beam */}
        <path
          d="M18 10L33 10C34.5 10 35.5 11.2 34.8 12.6L32.2 17.5C31.8 18.2 31.1 18.7 30.3 18.7H21.5L25 10H18Z"
          fill="url(#fitoraGradAccent)"
        />

        {/* Mid Acceleration Spark Bar */}
        <path
          d="M16 20.5L27.5 20.5C28.6 20.5 29.4 21.4 29 22.4L27.5 25.5C27.2 26.1 26.6 26.5 25.9 26.5H19L16 20.5Z"
          fill="#4edea3"
        />

        {/* Glowing Tech Kinetic Accent Dot */}
        <circle cx="34" cy="9" r="2" fill="#9ddf2e" className="animate-pulse" />
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'text' && LogoMark}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-headline font-black tracking-wider text-[#d8e3fb] ${textSizes}`}
          >
            FIT<span className="text-[#4edea3]">ORA</span>
          </span>
          {showBadge && (
            <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
              PRO
            </span>
          )}
        </div>
        {size !== 'sm' && (
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#86948a] -mt-0.5">
            Intelligent Fitness
          </span>
        )}
      </div>
    </div>
  );
};
