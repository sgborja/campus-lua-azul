import {
  Cat,
  Moon,
  Star,
  Sun,
  Flower2,
  Leaf,
  Heart,
  Sparkles,
  BookOpen,
  Award,
  LucideIcon,
} from 'lucide-react';

export const AVATAR_ICONS: Record<string, LucideIcon> = {
  Cat,
  Moon,
  Star,
  Sun,
  Flower2,
  Leaf,
  Heart,
  Sparkles,
  BookOpen,
  Award,
};

export const ICON_AVATAR_PREFIX = 'icon:';

export function isIconAvatar(avatar?: string): boolean {
  return !!avatar && avatar.startsWith(ICON_AVATAR_PREFIX);
}

export default function UserAvatar({
  avatar,
  name,
  className = 'w-8 h-8',
}: {
  avatar?: string;
  name?: string;
  className?: string;
}) {
  if (isIconAvatar(avatar)) {
    const iconName = avatar!.slice(ICON_AVATAR_PREFIX.length);
    const Icon = AVATAR_ICONS[iconName] || Cat;
    return (
      <div
        className={`${className} rounded-full bg-celeste/50 text-azul flex items-center justify-center border border-verde/30 flex-shrink-0`}
      >
        <Icon className="w-[60%] h-[60%]" />
      </div>
    );
  }

  if (!avatar) {
    return (
      <div
        className={`${className} rounded-full bg-azul-950 border border-verde/30 flex-shrink-0 flex items-center justify-center overflow-hidden`}
      >
        <img
          src="/images/lua-azul-cat-moon.png"
          alt={name || 'Lua Azul'}
          className="w-[80%] h-[80%] object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name || 'Avatar'}
      className={`${className} rounded-full object-cover border border-verde/30 flex-shrink-0`}
    />
  );
}
