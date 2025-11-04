import { PropsWithChildren } from "react";
import { m, useReducedMotion } from "framer-motion";

export const PhoneMockup = ({ children }: PropsWithChildren) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      aria-label="Phone mockup"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      className="relative mx-auto w-[240px] md:w-[300px]"
    >
      {/* Realistic contact shadow - soft, spread out */}
      <div className="absolute -bottom-4 left-1/2 h-6 w-[75%] -translate-x-1/2 rounded-[50%] bg-gradient-radial from-black/30 via-black/15 to-transparent blur-2xl" />
      
      {/* Subtle ambient light reflection */}
      <div className="pointer-events-none absolute -inset-x-6 -top-2 -bottom-8 -z-10">
        <div className="absolute left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-gradient-radial from-emerald-400/8 via-cyan-400/5 to-transparent blur-3xl" />
      </div>

      {/* iPhone Pro Max frame - photorealistic titanium */}
      <div className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-[#e8e9ea] via-[#d1d3d5] to-[#c4c6c8] p-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.15)]">
        
        {/* LEFT SIDE BUTTONS */}
        {/* Mute switch (top left, very small) */}
        <div 
          className="absolute -left-[2px] top-[52px] z-10 h-[12px] w-[2px] rounded-l-sm bg-gradient-to-r from-[#a8abad] via-[#c9cbcd] to-[#d4d6d8] shadow-[inset_-1px_0_1px_rgba(0,0,0,0.3),inset_1px_0_1px_rgba(255,255,255,0.4)]"
        />
        
        {/* Volume Up button */}
        <div 
          className="absolute -left-[2.5px] top-[82px] z-10 h-[28px] w-[2.5px] rounded-l-md bg-gradient-to-r from-[#a8abad] via-[#c9cbcd] to-[#d4d6d8] shadow-[inset_-1px_0_2px_rgba(0,0,0,0.35),inset_1px_0_2px_rgba(255,255,255,0.5)]"
        />
        
        {/* Volume Down button */}
        <div 
          className="absolute -left-[2.5px] top-[118px] z-10 h-[28px] w-[2.5px] rounded-l-md bg-gradient-to-r from-[#a8abad] via-[#c9cbcd] to-[#d4d6d8] shadow-[inset_-1px_0_2px_rgba(0,0,0,0.35),inset_1px_0_2px_rgba(255,255,255,0.5)]"
        />
        
        {/* RIGHT SIDE BUTTON */}
        {/* Power/Lock button (longer) */}
        <div 
          className="absolute -right-[2.5px] top-[95px] z-10 h-[42px] w-[2.5px] rounded-r-md bg-gradient-to-l from-[#a8abad] via-[#c9cbcd] to-[#d4d6d8] shadow-[inset_1px_0_2px_rgba(0,0,0,0.35),inset_-1px_0_2px_rgba(255,255,255,0.5)]"
        />

        {/* Inner frame/bezel - black rim */}
        <div className="relative overflow-hidden rounded-[2.7rem] bg-black p-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(0,0,0,0.5)]">
          
          {/* OLED Screen area */}
          <div 
            className="relative overflow-hidden rounded-[2.35rem] bg-gradient-to-br from-[#f0f4ff] via-[#f7f3ff] to-[#fff0f8]" 
            style={{ aspectRatio: "9 / 19.5" }}
          >
            {/* Screen glass effect - very subtle highlights */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
            
            {/* Top glass reflection bar */}
            <div className="absolute inset-x-2 top-0 h-[1.5px] bg-gradient-to-b from-white/40 to-transparent" />

            {/* Dynamic Island - precise proportions */}
            <div 
              className="absolute left-1/2 top-[9px] z-30 h-[20px] w-[28%] -translate-x-1/2 rounded-full bg-black shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_0.5px_1px_rgba(0,0,0,0.6)]"
            />

            {/* iOS Status bar */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-[6px] text-[10px] font-semibold text-gray-900">
              <span className="tracking-tight">9:41</span>
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {/* WiFi */}
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a7 7 0 017 7c0 2-1.5 3.5-3 4l-1.5-2c1-.5 1.5-1.5 1.5-2a4 4 0 00-8 0c0 .5.5 1.5 1.5 2L6 14.5c-1.5-.5-3-2-3-4a7 7 0 017-7z" />
                </svg>
                {/* Battery */}
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                  <path d="M23 10v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* App content area */}
            <div className="absolute inset-0 px-4 pb-3 pt-[42px]">
              {children}
              
              {/* iOS Home indicator */}
              <div className="absolute bottom-1.5 left-1/2 h-[3px] w-[90px] -translate-x-1/2 rounded-full bg-black/25" />
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};
