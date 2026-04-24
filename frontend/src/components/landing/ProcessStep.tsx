import React from 'react';

export default function ProcessStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
     <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[220px]">
        <div className="w-16 h-16 bg-black border-2 border-white flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
           <span className="font-black text-xl text-white">{num}</span>
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest mb-3 text-white">{title}</h4>
        <p className="text-xs text-gray-400 font-mono leading-relaxed">{desc}</p>
     </div>
  );
}
