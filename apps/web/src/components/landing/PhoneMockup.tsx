import type { PropsWithChildren } from "react";
import { m, useReducedMotion } from "framer-motion";

export const PhoneMockup = ({ children }: PropsWithChildren) => {
  const prefersReducedMotion = useReducedMotion();
  // Framer Motion typing workaround for React 19 strict TS builds
  const MDiv = m.div as any;

  return (
    <MDiv
      aria-label="Phone mockup"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      className="relative mx-auto w-[240px] md:w-[300px]"
    >
      {/* Multiple layered shadows for depth */}
      {/* Primary contact shadow */}
      <div 
        className="absolute -bottom-1 left-1/2 h-12 w-[85%] -translate-x-1/2 bg-black/35 blur-[40px]"
        style={{ 
          borderRadius: '50%',
          transform: 'translateX(-50%) scaleY(0.25)'
        }}
      />
      {/* Secondary soft ambient shadow */}
      <div 
        className="absolute -bottom-3 left-1/2 h-16 w-[95%] -translate-x-1/2 bg-black/20 blur-[50px]"
        style={{ 
          borderRadius: '50%',
          transform: 'translateX(-50%) scaleY(0.2)'
        }}
      />
      {/* Tertiary outer glow */}
      <div 
        className="absolute -bottom-6 left-1/2 h-20 w-[110%] -translate-x-1/2 bg-black/10 blur-[60px]"
        style={{ 
          borderRadius: '50%',
          transform: 'translateX(-50%) scaleY(0.15)'
        }}
      />

      {/* iPhone 16 Pro frame - Natural Titanium */}
      <div className="relative overflow-hidden rounded-[2.8rem] shadow-[0_16px_48px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-neutral-900/10 dark:ring-white/10"
        style={{
          background: 'linear-gradient(145deg, #f8f8f9 0%, #e5e6e8 40%, #d8d9db 70%, #d0d1d3 100%)',
          padding: '2px'
        }}
      >
        
        {/* LEFT SIDE BUTTONS - iPhone 16 style, more prominent */}
        {/* Mute/Action button (rounded, top) */}
        <div 
          className="absolute top-[50px] z-30 h-[16px] w-[4px] rounded-l-full"
          style={{
            left: '-3px',
            background: 'linear-gradient(to right, #a5a7a9 0%, #c5c7c9 30%, #dfe1e3 70%, #e8eaec 100%)',
            boxShadow: `
              inset -2px 0 3px rgba(0,0,0,0.5),
              inset 1px 0 2px rgba(255,255,255,0.7),
              -2px 0 4px rgba(0,0,0,0.3),
              -1px 0 2px rgba(0,0,0,0.2)
            `
          }}
        />
        
        {/* Volume Up button (elongated oval) */}
        <div 
          className="absolute top-[82px] z-30 h-[36px] w-[4px] rounded-l-full"
          style={{
            left: '-3px',
            background: 'linear-gradient(to right, #a5a7a9 0%, #c5c7c9 30%, #dfe1e3 70%, #e8eaec 100%)',
            boxShadow: `
              inset -2px 0 3px rgba(0,0,0,0.5),
              inset 1px 0 2px rgba(255,255,255,0.7),
              -2px 0 4px rgba(0,0,0,0.3),
              -1px 0 2px rgba(0,0,0,0.2)
            `
          }}
        />
        
        {/* Volume Down button (elongated oval) */}
        <div 
          className="absolute top-[126px] z-30 h-[36px] w-[4px] rounded-l-full"
          style={{
            left: '-3px',
            background: 'linear-gradient(to right, #a5a7a9 0%, #c5c7c9 30%, #dfe1e3 70%, #e8eaec 100%)',
            boxShadow: `
              inset -2px 0 3px rgba(0,0,0,0.5),
              inset 1px 0 2px rgba(255,255,255,0.7),
              -2px 0 4px rgba(0,0,0,0.3),
              -1px 0 2px rgba(0,0,0,0.2)
            `
          }}
        />
        
        {/* RIGHT SIDE BUTTON - Power/Lock (longer, prominent) */}
        <div 
          className="absolute top-[92px] z-30 h-[48px] w-[4px] rounded-r-full"
          style={{
            right: '-3px',
            background: 'linear-gradient(to left, #a5a7a9 0%, #c5c7c9 30%, #dfe1e3 70%, #e8eaec 100%)',
            boxShadow: `
              inset 2px 0 3px rgba(0,0,0,0.5),
              inset -1px 0 2px rgba(255,255,255,0.7),
              2px 0 4px rgba(0,0,0,0.3),
              1px 0 2px rgba(0,0,0,0.2)
            `
          }}
        />

        {/* Black bezel with enhanced shadows */}
        <div className="relative overflow-hidden rounded-[2.7rem] bg-black p-[4px]"
          style={{
            boxShadow: `
              inset 0 0 0 1px rgba(0,0,0,0.95),
              inset 0 2px 6px rgba(0,0,0,0.7),
              inset 0 -1px 3px rgba(0,0,0,0.5)
            `
          }}
        >
          
          {/* OLED Screen */}
          <div 
            className="relative overflow-hidden rounded-[2.35rem] bg-gradient-to-b from-slate-50 via-indigo-50 to-rose-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950"
            style={{ 
              aspectRatio: "9 / 19.5",
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            {/* Screen glass overlay with subtle reflections */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 dark:from-white/5 dark:to-black/20" />
            
            {/* Top glass reflection bar */}
            <div className="absolute inset-x-2 top-0 h-[2px] bg-gradient-to-b from-white/50 to-transparent" />

            {/* Dynamic Island - precise iPhone 16 dimensions */}
            <div 
              className="absolute left-1/2 top-[9px] z-30 h-[21px] w-[29%] -translate-x-1/2 rounded-full bg-black"
              style={{
                boxShadow: `
                  0 5px 15px rgba(0,0,0,0.6),
                  inset 0 1px 3px rgba(0,0,0,0.9),
                  inset 0 -1px 1px rgba(255,255,255,0.05)
                `
              }}
            />

            {/* iOS Status bar */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-[6px] text-[10px] font-semibold text-gray-900 dark:text-gray-100">
              <span className="tracking-tight">9:41</span>
              <div className="flex items-center gap-1">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a7 7 0 017 7c0 2-1.5 3.5-3 4l-1.5-2c1-.5 1.5-1.5 1.5-2a4 4 0 00-8 0c0 .5.5 1.5 1.5 2L6 14.5c-1.5-.5-3-2-3-4a7 7 0 017-7z" />
                </svg>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                  <path d="M23 10v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* App content */}
            <div className="absolute inset-0 px-4 pb-3 pt-[42px]">
              {children}
              
              {/* Home indicator */}
              <div 
                className="absolute bottom-1.5 left-1/2 h-[3px] w-[90px] -translate-x-1/2 rounded-full bg-black/30 dark:bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </MDiv>
  );
};
