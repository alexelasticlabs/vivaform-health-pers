import { m, useReducedMotion } from "framer-motion";

export const ProgressCard = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#2CC5A5] via-teal-500 to-cyan-600 p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase leading-tight tracking-wide text-white/85">Today's Progress</p>
          <p className="mt-2.5 text-[26px] font-bold leading-tight text-white">On track 💪</p>
        </div>
        <span className="rounded-xl bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">Day 24</span>
      </div>
      <p className="mt-2.5 text-xs font-medium leading-relaxed text-white/95">1,540 cal • 104g protein • 8 glasses</p>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/30">
        {prefersReducedMotion ? (
          <div className="h-full w-[86%] rounded-full bg-white shadow-sm" />
        ) : (
          <m.div
            className="h-full rounded-full bg-white shadow-sm"
            initial={{ width: "84%" }}
            animate={{ width: ["84%", "88%", "86%"] }}
            transition={{ duration: 3.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
};
