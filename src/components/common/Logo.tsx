import React from 'react';

interface LogoProps {
  variant?: 'primary' | 'icon' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'primary',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  // Dimensions per size
  const sizes = {
    sm: { icon: 'w-8 h-8', title: 'text-sm tracking-tight', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', title: 'text-base font-black tracking-tight', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 'w-14 h-14', title: 'text-xl font-black tracking-tight', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', title: 'text-3xl font-black tracking-tight', sub: 'text-sm', gap: 'gap-4' }
  };

  const currentSize = sizes[size];

  // Dark background awareness
  const isDarkBg = variant === 'light';
  const textColorClass = isDarkBg ? 'text-white' : 'text-slate-900 dark:text-white';
  const subColorClass = isDarkBg ? 'text-cyan-300' : 'text-teal-600 dark:text-cyan-400';

  const logoGraphic = (
    <div className={`relative ${currentSize.icon} shrink-0 group select-none`}>
      {/* Outer Glow Ring */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-600 rounded-full blur-[2px] opacity-75 group-hover:opacity-100 transition duration-300"></div>
      
      {/* High Resolution Brand Logo Emblem */}
      <img
        src="/logo.png"
        alt="Hatimi Washing Machine Hub Emblem"
        className="relative w-full h-full object-cover rounded-full border border-teal-400/40 shadow-md transform group-hover:scale-105 transition-transform duration-300 bg-slate-950"
      />
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} title="Hatimi Washing Machine Hub">
        {logoGraphic}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {logoGraphic}
      <div className="flex flex-col leading-none select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-600 ${currentSize.title}`}>
            HATIMI
          </span>
          <span className={`font-extrabold uppercase tracking-wide ${textColorClass} opacity-90`}>
            WASHING MACHINE HUB
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-bold uppercase tracking-widest mt-0.5 ${currentSize.sub} ${subColorClass}`}>
            PREMIUM REFURBISHED APPLIANCES
          </span>
        )}
      </div>
    </div>
  );
};
