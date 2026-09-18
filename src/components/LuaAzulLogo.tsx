import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'horizontal';
  color?: string; // Hex or tailwind class
  subtitle?: string;
  inverted?: boolean;
}

export function StarIcon({ className = 'w-3 h-3 text-dorado' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C12 7.5 7.5 12 0 12C7.5 12 12 16.5 12 24C12 16.5 16.5 12 24 12C16.5 12 12 7.5 12 0Z" />
    </svg>
  );
}

export default function LuaAzulLogo({
  className = '',
  variant = 'horizontal',
  color = '#2E4C82',
  subtitle = 'Seminarios',
  inverted = false,
}: LogoProps) {
  const logoImage = (
    <div className={`relative w-12 h-12 flex-shrink-0 ${inverted ? 'brightness-0 invert' : ''}`}>
      <Image
        src="/images/lua-azul-cat-moon.png"
        alt="Logo Lua Azul - Gata en la Luna"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );

  if (variant === 'symbol') {
    return <div className={`inline-block ${className}`}>{logoImage}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoImage}
      <div className="flex flex-col">
        <span
          className="font-firma text-3xl sm:text-4xl leading-none select-none pt-1"
          style={{ color: inverted ? '#ffffff' : color }}
        >
          Lua Azul
        </span>
        {subtitle && (
          <span
            className="font-serif text-[11px] uppercase tracking-[0.25em] font-bold ml-0.5 mt-0.5"
            style={{ color: inverted ? '#C9E1F7' : '#B8893A' }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
