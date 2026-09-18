import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'horizontal';
  color?: string; // Hex or tailwind class
  subtitle?: string;
}

export function StarIcon({ className = 'w-3 h-3 text-dorado' }: { className?: string }) {
  // 4-pointed star from Lua Azul manual
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
}: LogoProps) {
  // Vector symbol: Cat sitting on crescent moon with 3 four-pointed stars
  const symbolSvg = (
    <svg
      viewBox="0 0 100 100"
      fill={color}
      className="w-full h-full object-contain"
      aria-label="Símbolo Lua Azul: Gata en la luna creciente"
    >
      {/* Crescent Moon */}
      <path d="M 52,14 C 32,18 20,38 22,58 C 24,76 40,90 60,88 C 65,87 70,85 74,82 C 60,86 42,80 34,68 C 26,56 28,36 40,24 C 44,20 48,16 52,14 Z" />
      
      {/* Cat Silhouette */}
      <path d="M 50,44 C 48,44 46,46 45,48 C 44,52 46,58 46,62 C 45,66 42,70 41,74 C 41,76 43,78 45,78 C 47,78 49,75 50,72 C 51,68 53,64 54,60 C 54,56 53,52 52,48 C 52,46 51,44 50,44 Z" />
      
      {/* Cat Head & Ears */}
      <path d="M 50,38 C 47,38 45,41 45,44 C 47,45 49,45 51,44 C 52,42 53,40 54,39 C 54,37 53,36 51,37 C 50,37 49,36 48,35 C 47,36 46,37 46,38 Z" />
      
      {/* Cat Tail with spiral swirl */}
      <path d="M 43,74 C 38,76 34,80 34,85 C 34,90 39,94 44,92 C 48,90 50,86 48,82 C 46,78 40,78 40,82 C 40,84 43,85 44,84 C 44,83 43,82 42,82 C 41,82 40,84 42,86 C 44,87 46,86 46,84 C 46,80 40,76 43,74 Z" />
      
      {/* 3 Four-pointed Stars */}
      {/* Star 1 (Top right large) */}
      <path d="M 72,20 C 72,24 69,27 65,27 C 69,27 72,30 72,34 C 72,30 75,27 79,27 C 75,27 72,24 72,20 Z" />
      
      {/* Star 2 (Middle right medium) */}
      <path d="M 80,38 C 80,41 78,43 75,43 C 78,43 80,45 80,48 C 80,45 82,43 85,43 C 82,43 80,41 80,38 Z" />
      
      {/* Star 3 (Top left small) */}
      <path d="M 60,12 C 60,14 59,15 57,15 C 59,15 60,16 60,18 C 60,16 61,15 63,15 C 61,15 60,14 60,12 Z" />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-block ${className}`}>{symbolSvg}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-11 h-11 flex-shrink-0">{symbolSvg}</div>
      <div className="flex flex-col">
        <span
          className="font-firma text-3xl sm:text-4xl leading-none text-azul select-none pt-1"
          style={{ color }}
        >
          Lua Azul
        </span>
        {subtitle && (
          <span className="font-serif text-[11px] uppercase tracking-[0.25em] text-dorado font-bold ml-0.5 mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
