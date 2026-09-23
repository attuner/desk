import React from 'react';
import * as LucideIcons from 'lucide-react';

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AppIconRenderer: React.FC<AppIconProps> = ({ name, className = 'w-6 h-6', size = 24 }) => {
  // If name is an image URL
  if (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('data:image/')) {
    return <img src={name} alt="" className={`object-contain rounded ${className}`} />;
  }

  // If name is an emoji
  if (name.length <= 4 && /\p{Extended_Pictographic}/u.test(name)) {
    return <span style={{ fontSize: size }} className="leading-none select-none">{name}</span>;
  }

  // Check Lucide Icons
  const IconComponent = (LucideIcons as any)[name] || (LucideIcons as any)['AppWindow'];
  return <IconComponent className={className} size={size} />;
};
