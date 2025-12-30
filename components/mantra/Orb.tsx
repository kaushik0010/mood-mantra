'use client';

interface OrbProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
}

export function Orb({ state }: OrbProps) {
  const isActive = state === 'listening' || state === 'speaking';
  
  const blobBase = "absolute top-0 left-0 size-full rounded-full mix-blend-multiply filter-blur-xl opacity-70 transition-all duration-1500 ease-out";

  const containerScale = isActive ? "scale-110" : "scale-100";
  const anim1 = isActive ? "@animation-[blob-spin_12s_linear_infinite]" : "@animation-[blob-spin_25s_linear_infinite]";
  const anim2 = isActive ? "@animation-[blob-spin_15s_linear_infinite_reverse]" : "@animation-[blob-spin_30s_linear_infinite_reverse]";
  
  const gradient1 = state === 'thinking' ? 'from-purple-400/70 to-indigo-500/70' : 'from-cyan-300/60 to-blue-500/60';
  const gradient2 = state === 'thinking' ? 'from-fuchsia-400/70 to-purple-500/70' : 'from-blue-300/60 to-emerald-400/60';

  return (
    <div className={`relative size-48 sm:size-56 md:size-64 lg:size-72 flex items-center justify-center transition-all duration-1500 ${containerScale}`}>
      {/* Outer glow */}
      <div className={`absolute -inset-4 sm:-inset-6 bg-linear-to-r ${gradient1} rounded-full blur-2xl opacity-10 transition-opacity duration-1500 ${isActive ? 'opacity-30' : 'opacity-10'}`}></div>
      
      {/* Gooey Container */}
      <div className="gooey-filter relative size-full bg-transparent">
        {/* Blob 1 */}
        <div className={`${blobBase} bg-linear-to-r ${gradient1} ${anim1}`}></div>
        {/* Blob 2 */}
        <div className={`${blobBase} bg-linear-to-l ${gradient2} ${anim2} -left-3 -top-2 sm:-left-4 sm:-top-3`}></div>
      </div>
      
      {/* Center glow */}
      <div className={`absolute inset-4 sm:inset-6 bg-linear-to-r ${gradient1} rounded-full blur-xl opacity-5 transition-opacity duration-1500 ${isActive ? 'opacity-20' : 'opacity-5'}`}></div>
    </div>
  );
}