'use client';

import React from 'react';

interface UserAvatarProps {
  name?: string;
  id?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showBorder?: boolean;
}

// Curated modern muted palettes for Tulis FinTech aesthetic
const AVATAR_PALETTES = [
  {
    bg: 'from-emerald-500/20 via-emerald-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#10B981',
    fill: '#059669',
    secondary: '#047857',
  },
  {
    bg: 'from-blue-500/20 via-blue-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#3B82F6',
    fill: '#2563EB',
    secondary: '#1D4ED8',
  },
  {
    bg: 'from-purple-500/20 via-purple-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#8B5CF6',
    fill: '#7C3AED',
    secondary: '#6D28D9',
  },
  {
    bg: 'from-amber-500/20 via-amber-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#F59E0B',
    fill: '#D97706',
    secondary: '#B45309',
  },
  {
    bg: 'from-rose-500/20 via-rose-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#F43F5E',
    fill: '#E11D48',
    secondary: '#BE123C',
  },
  {
    bg: 'from-teal-500/20 via-teal-600/15 to-surface-inset',
    border: 'border-surface-hairline',
    accent: '#14B8A6',
    fill: '#0D9488',
    secondary: '#0F766E',
  },
];

// 6 distinct fresh-looking geometric persona SVGs
const renderPersonaSVG = (index: number, palette: typeof AVATAR_PALETTES[0]) => {
  switch (index % 6) {
    case 0:
      // Persona: Modern explorer with glasses & beanie
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Head & Neck */}
          <rect x="20" y="32" width="8" height="6" rx="2" fill={palette.secondary} opacity="0.6" />
          <circle cx="24" cy="22" r="11" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Beanie Cap */}
          <path d="M13 18C13 11.9249 17.9249 7 24 7C30.0751 7 35 11.9249 35 18H13Z" fill={palette.accent} />
          <rect x="12" y="17" width="24" height="3.5" rx="1.5" fill={palette.fill} />
          {/* Minimalist Glasses */}
          <circle cx="19" cy="22" r="3.5" stroke="#18181b" strokeWidth="1.8" fill="none" />
          <circle cx="29" cy="22" r="3.5" stroke="#18181b" strokeWidth="1.8" fill="none" />
          <line x1="22.5" y1="22" x2="25.5" y2="22" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Friendly Smile */}
          <path d="M21 28C22 29.5 26 29.5 27 28" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Shoulders */}
          <path d="M10 44C10 38 15 35 24 35C33 35 38 38 38 44" fill={palette.secondary} opacity="0.5" />
        </svg>
      );

    case 1:
      // Persona: Creative traveler with curly top & smile
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Curly hair blobs */}
          <circle cx="17" cy="14" r="5.5" fill={palette.accent} />
          <circle cx="24" cy="11" r="6" fill={palette.fill} />
          <circle cx="31" cy="14" r="5.5" fill={palette.accent} />
          <circle cx="14" cy="20" r="4.5" fill={palette.secondary} />
          <circle cx="34" cy="20" r="4.5" fill={palette.secondary} />
          {/* Face */}
          <circle cx="24" cy="23" r="10.5" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Eyes with lashes */}
          <circle cx="19.5" cy="22" r="1.6" fill="#18181b" />
          <circle cx="28.5" cy="22" r="1.6" fill="#18181b" />
          {/* Blush */}
          <circle cx="17.5" cy="25" r="2" fill={palette.accent} opacity="0.4" />
          <circle cx="30.5" cy="25" r="2" fill={palette.accent} opacity="0.4" />
          {/* Confident Smile */}
          <path d="M21 26.5C22.5 28.5 25.5 28.5 27 26.5" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Jacket */}
          <path d="M11 44C11 37.5 16.5 35 24 35C31.5 35 37 37.5 37 44" fill={palette.accent} opacity="0.6" />
        </svg>
      );

    case 2:
      // Persona: Tech traveler with headphones
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="24" cy="23" r="11" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Modern Slick Hair */}
          <path d="M13 21C13 13 18 10 26 10C32 10 35 14 35 18C30 15 20 16 13 21Z" fill={palette.secondary} />
          {/* Over-ear Headphones Band */}
          <path d="M10 24C10 14 16 9 24 9C32 9 38 14 38 24" stroke={palette.fill} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Headphone ear pads */}
          <rect x="8" y="20" width="4.5" height="9" rx="2" fill={palette.accent} />
          <rect x="35.5" y="20" width="4.5" height="9" rx="2" fill={palette.accent} />
          {/* Eyes */}
          <circle cx="20" cy="23" r="1.5" fill="#18181b" />
          <circle cx="28" cy="23" r="1.5" fill="#18181b" />
          {/* Smile */}
          <path d="M21.5 27.5C22.8 28.8 25.2 28.8 26.5 27.5" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Hoodie */}
          <path d="M11 44C11 38 16 36 24 36C32 36 37 38 37 44" fill={palette.fill} opacity="0.5" />
        </svg>
      );

    case 3:
      // Persona: Adventurer with outdoor cap & band
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Face */}
          <circle cx="24" cy="24" r="10.5" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Five-panel Camp Cap */}
          <path d="M13 19C13 13 18 8 26 8C31 8 35 12 35 19H13Z" fill={palette.accent} />
          <path d="M11 19H37L39 21.5H9L11 19Z" fill={palette.fill} />
          {/* Eyes */}
          <circle cx="19.5" cy="24.5" r="1.6" fill="#18181b" />
          <circle cx="28.5" cy="24.5" r="1.6" fill="#18181b" />
          {/* Cheerful grin */}
          <path d="M20.5 29C22 30.5 26 30.5 27.5 29" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Expedition Jacket Collar */}
          <path d="M11 44C11 38 16 35.5 24 35.5C32 35.5 37 38 37 44" fill={palette.secondary} opacity="0.6" />
          <line x1="24" y1="36" x2="24" y2="44" stroke={palette.fill} strokeWidth="1.5" />
        </svg>
      );

    case 4:
      // Persona: Sleek architect / designer with round glasses
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Top bun hair */}
          <circle cx="24" cy="8" r="4.5" fill={palette.secondary} />
          <circle cx="24" cy="22" r="11" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Side swept hair */}
          <path d="M13 18C16 12 24 10 35 14C35 18 31 16 24 16C17 16 14 18 13 18Z" fill={palette.accent} />
          {/* Circular Architectural Glasses */}
          <circle cx="19" cy="22.5" r="4" stroke="#18181b" strokeWidth="1.8" fill="none" />
          <circle cx="29" cy="22.5" r="4" stroke="#18181b" strokeWidth="1.8" fill="none" />
          <line x1="23" y1="22.5" x2="25" y2="22.5" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Minimalist mouth */}
          <path d="M22 28.5H26" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Turtleneck collar */}
          <rect x="20" y="33" width="8" height="4" rx="1.5" fill={palette.secondary} />
          <path d="M11 44C11 38.5 15.5 36.5 24 36.5C32.5 36.5 37 38.5 37 44" fill={palette.fill} opacity="0.5" />
        </svg>
      );

    case 5:
    default:
      // Persona: Jet-setter with aviators & dynamic hair
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Face */}
          <circle cx="24" cy="23" r="10.5" fill="currentColor" className="text-zinc-200 dark:text-zinc-100" />
          {/* Modern Spiky / Textured Hair */}
          <path d="M13 19C14 11 19 8 25 8C31 8 35 12 35 18C32 14 26 12 20 15C16 17 14 19 13 19Z" fill={palette.accent} />
          {/* Cool Aviator sunglasses */}
          <path d="M16 20H22L21.5 25C21.5 26.5 19.5 27 17.5 26C16 25 15.5 22 16 20Z" fill="#18181b" />
          <path d="M26 20H32L32.5 22C33 25 31.5 26 30.5 26C28.5 27 26.5 26.5 26.5 25L26 20Z" fill="#18181b" />
          <line x1="22" y1="20.5" x2="26" y2="20.5" stroke="#18181b" strokeWidth="1.5" />
          {/* Smile */}
          <path d="M21 28.5C22.5 30 25.5 30 27 28.5" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Collar */}
          <path d="M11 44C11 38 16 35.5 24 35.5C32 35.5 37 38 37 44" fill={palette.accent} opacity="0.6" />
        </svg>
      );
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Traveler',
  id = '',
  avatarUrl,
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Deterministic seed based on name + id
  const str = (id + name).toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  const palette = AVATAR_PALETTES[index % AVATAR_PALETTES.length];

  // Size mapping
  let dimClass = 'w-10 h-10';
  if (typeof size === 'number') {
    dimClass = '';
  } else {
    switch (size) {
      case 'xs':
        dimClass = 'w-5 h-5';
        break;
      case 'sm':
        dimClass = 'w-7 h-7';
        break;
      case 'md':
        dimClass = 'w-10 h-10';
        break;
      case 'lg':
        dimClass = 'w-12 h-12';
        break;
      case 'xl':
        dimClass = 'w-16 h-16';
        break;
    }
  }

  const customStyle = typeof size === 'number' ? { width: size, height: size } : {};

  // If a valid image URL is provided (e.g. for the Goa demo trip), display it
  if (avatarUrl && avatarUrl.trim().length > 0 && !imageError) {
    return (
      <span
        style={customStyle}
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${
          showBorder ? 'border border-surface-hairline' : ''
        } shadow-subtle select-none ${dimClass} ${className}`}
        title={name}
      >
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </span>
    );
  }

  return (
    <span
      style={customStyle}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-gradient-to-tr ${palette.bg} ${
        showBorder ? `border ${palette.border}` : ''
      } shadow-subtle select-none transition-transform duration-200 group-hover:scale-105 ${dimClass} ${className}`}
      title={name}
    >
      {/* Background radial glow */}
      <span
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at 35% 25%, ${palette.accent} 0%, transparent 70%)`,
        }}
      />

      {/* Fresh Character Persona SVG */}
      <span className="relative z-10 w-full h-full flex items-center justify-center">
        {renderPersonaSVG(index, palette)}
      </span>
    </span>
  );
};
