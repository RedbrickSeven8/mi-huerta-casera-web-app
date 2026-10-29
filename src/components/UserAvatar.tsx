import React from 'react';
import { Coffee } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  picture?: string;
  isDonor?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  picture,
  isDonor = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  const badgeSizeClasses = {
    xs: 'w-3 h-3 p-0.5 right-[-2px] bottom-[-2px]',
    sm: 'w-4 h-4 p-0.5 right-[-2px] bottom-[-2px]',
    md: 'w-5 h-5 p-1 right-[-3px] bottom-[-3px]',
    lg: 'w-6 h-6 p-1 right-[-2px] bottom-[-2px]'
  };

  const coffeeIconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {picture ? (
        <img
          src={picture}
          alt={name}
          className={`${sizeClasses[size]} rounded-full border border-[#2D5A27]/30 object-cover shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold shadow-xs`}
        >
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
      )}

      {isDonor && (
        <span
          title="Donante Verificado de Mi Huerta Casera"
          aria-label="Donante Verificado"
          className={`absolute ${badgeSizeClasses[size]} rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md border-2 border-white ring-1 ring-amber-400/50 animate-pulse`}
        >
          <Coffee className={coffeeIconSizes[size]} strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
};
