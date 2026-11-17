import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
  key?: any;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  delay = 100
}: TooltipProps) {
  const [active, setActive] = useState(false);
  let timeout: any;

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    clearTimeout(timeout);
    setActive(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && (
        <div
          className={`absolute z-[9999] pointer-events-none animate-fade-in ${positionClasses[position]}`}
          style={{ width: 'max-content', maxWidth: '220px' }}
        >
          <div className="bg-slate-900 border border-slate-800 text-white font-sans text-[11px] font-medium py-1.5 px-2.5 rounded shadow-md leading-normal select-none">
            {content}
          </div>
          <div className={`w-0 h-0 border-4 border-solid absolute ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}
