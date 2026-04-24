import React from 'react';

export default function ProtocolCard({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.05] transition-colors">
      <div className="text-gray-600 font-black text-4xl mb-6">{num}</div>
      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">{title}</h3>
      <p className="text-gray-400 font-mono text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
