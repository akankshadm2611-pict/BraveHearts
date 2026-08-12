import React, { useId } from 'react';

interface LogoHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  showSubtitle?: boolean;
  className?: string;
  themeMode?: 'dark' | 'bright';
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  size = 'md',
  layout = 'vertical',
  showSubtitle = true,
  className = '',
  themeMode = 'dark',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const isHorizontal = layout === 'horizontal';

  const goldGradId = `goldGrad_${uniqueId}`;
  const innerGoldId = `innerGold_${uniqueId}`;
  const glowId = `glow_${uniqueId}`;
  const policeArcId = `policeArc_${uniqueId}`;

  return (
    <div
      className={`flex ${
        isHorizontal ? 'items-center space-x-2.5 sm:space-x-3 text-left' : 'flex-col items-center justify-center text-center'
      } ${className}`}
    >
      {/* Emblem SVG Logo replicating the official Crime Justice Golden Star & Lions Emblem */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center ${
          isHorizontal
            ? isSmall
              ? 'w-9 h-9 sm:w-10 sm:h-10'
              : 'w-12 h-12'
            : isLarge
            ? 'w-24 h-24 sm:w-28 sm:h-28 mb-2 sm:mb-3'
            : isSmall
            ? 'w-10 h-10 mb-1'
            : 'w-16 h-16 mb-2'
        }`}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_12px_rgba(234,179,8,0.4)] overflow-visible">
          <defs>
            <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id={innerGoldId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Laurels background wreath */}
          <g fill="none" stroke={`url(#${goldGradId})`} strokeWidth="3" opacity="0.85">
            <path d="M 30,120 Q 20,80 50,40 Q 70,20 100,20 Q 130,20 150,40 Q 180,80 170,120" />
            <path d="M 40,135 Q 25,95 60,55 Q 80,35 100,35 Q 120,35 140,55 Q 175,95 160,135" />
            {/* Laurel Leaves */}
            <circle cx="35" cy="80" r="4" fill={`url(#${goldGradId})`} />
            <circle cx="45" cy="60" r="4" fill={`url(#${goldGradId})`} />
            <circle cx="65" cy="40" r="4" fill={`url(#${goldGradId})`} />
            <circle cx="165" cy="80" r="4" fill={`url(#${goldGradId})`} />
            <circle cx="155" cy="60" r="4" fill={`url(#${goldGradId})`} />
            <circle cx="135" cy="40" r="4" fill={`url(#${goldGradId})`} />
          </g>

          {/* Golden Star Base */}
          <polygon
            points="100,15 122,68 180,68 133,103 150,158 100,123 50,158 67,103 20,68 78,68"
            fill={`url(#${goldGradId})`}
            stroke="#fef08a"
            strokeWidth="1.5"
            filter={`url(#${glowId})`}
          />

          {/* Inner Medallion Frame */}
          <circle cx="100" cy="92" r="42" fill="#090d16" stroke={`url(#${goldGradId})`} strokeWidth="4" />
          <circle cx="100" cy="92" r="38" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="3,2" />

          {/* POLICE Arc Text */}
          <path id={policeArcId} d="M 70,88 A 30,30 0 0,1 130,88" fill="none" />
          <text fill={`url(#${innerGoldId})`} fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">
            <textPath href={`#${policeArcId}`} startOffset="50%">POLICE</textPath>
          </text>

          {/* Stylized Emblem / Lions Silhouette */}
          <g fill={`url(#${goldGradId})`} transform="translate(85, 78) scale(0.35)">
            <path d="M20,5 C10,5 5,15 5,25 C5,35 15,40 20,50 C25,40 35,35 35,25 C35,15 30,5 20,5 Z" />
            <path d="M40,15 C30,15 25,25 25,35 C25,45 35,50 40,60 C45,50 55,45 55,35 C55,25 50,15 40,15 Z" />
            <path d="M60,25 C50,25 45,35 45,45 C45,55 55,60 60,70 C65,60 75,55 75,45 C75,35 70,25 60,25 Z" />
            <rect x="15" y="72" width="60" height="8" rx="2" fill={`url(#${innerGoldId})`} />
            <circle cx="45" cy="76" r="3" fill="#000" />
          </g>

          {/* Golden Ribbon Banner at Bottom */}
          <g transform="translate(0, 10)">
            <path
              d="M 25,155 Q 100,172 175,155 L 185,178 Q 100,195 15,178 Z"
              fill={`url(#${goldGradId})`}
              stroke="#fef3c7"
              strokeWidth="1"
            />
            {/* Ribbon fold shadow */}
            <path d="M 25,155 L 35,178 L 15,178 Z" fill="#713f12" />
            <path d="M 175,155 L 165,178 L 185,178 Z" fill="#713f12" />
            
            {/* Motto in Devanagari */}
            <text
              x="100"
              y="172"
              fill="#18181b"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="1"
            >
              सत्यमेव जयते
            </text>
          </g>
        </svg>
      </div>

      {/* Title & Subtitle Container */}
      <div className={isHorizontal ? 'flex flex-col justify-center leading-tight shrink-0 min-w-max' : 'flex flex-col items-center shrink-0 min-w-max'}>
        {/* Main Title: Crime Justice */}
        <h1
          className={`font-serif tracking-wider font-extrabold leading-none whitespace-nowrap shrink-0 ${
            isHorizontal
              ? isSmall
                ? 'text-xs sm:text-sm md:text-base lg:text-lg'
                : 'text-sm sm:text-lg md:text-xl'
              : isLarge
              ? 'text-2xl sm:text-4xl md:text-5xl'
              : isSmall
              ? 'text-sm sm:text-base'
              : 'text-lg sm:text-2xl'
          } ${
            themeMode === 'bright'
              ? 'text-amber-950 drop-shadow-sm font-black'
              : 'text-yellow-400 drop-shadow-[0_1px_6px_rgba(234,179,8,0.4)]'
          }`}
          style={{ color: themeMode === 'bright' ? '#78350f' : '#facc15' }}
        >
          CRIME JUSTICE
        </h1>

        {/* Subtitle */}
        {showSubtitle && (
          <p
            className={`tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold leading-tight whitespace-nowrap shrink-0 ${
              isHorizontal
                ? 'hidden sm:block text-[7.5px] sm:text-[8.5px] md:text-[9px] mt-0.5'
                : isLarge
                ? 'text-xs sm:text-sm mt-1'
                : isSmall
                ? 'text-[7.5px] sm:text-[8px]'
                : 'text-[10px] sm:text-xs mt-0.5'
            } ${themeMode === 'bright' ? 'text-amber-950 font-black' : 'text-amber-300/90'}`}
          >
            TRUTH • EVIDENCE • JUSTICE
          </p>
        )}
      </div>
    </div>
  );
};
