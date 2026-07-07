'use client';

import { useState } from 'react';
import { CHANGELOG } from '@/data/changelog';

export default function ChangelogPanel() {
  const [open, setOpen] = useState(false);
  const latest = CHANGELOG[0];
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5">
      {open && (
        <div className="w-72 max-h-80 overflow-y-auto bg-gray-950/95 border border-gray-800 rounded-xl shadow-2xl backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Changelog</span>
            <button onClick={()=>setOpen(false)} className="text-gray-600 hover:text-gray-300 text-base leading-none">✕</button>
          </div>
          <div className="flex flex-col divide-y divide-gray-800/60">
            {CHANGELOG.map(entry=>(
              <div key={entry.version} className="px-4 py-3">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded" style={{background:entry.version===latest.version?'#ffd70033':'#1a2030',color:entry.version===latest.version?'#ffd700':'#666',border:`1px solid ${entry.version===latest.version?'#ffd70055':'#252d3d'}`}}>v{entry.version}</span>
                  <span className="text-[11px] font-semibold text-gray-300">{entry.title}</span>
                  <span className="text-[9px] text-gray-600 ml-auto">{entry.date}</span>
                </div>
                <ul className="flex flex-col gap-0.5">
                  {entry.notes.map((note,i)=>(
                    <li key={i} className="flex gap-1.5 text-[10px] text-gray-500 leading-relaxed"><span className="text-gray-700 flex-shrink-0">–</span><span>{note}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-950/90 border border-gray-800 hover:border-gray-600 text-[10px] font-bold text-gray-500 hover:text-gray-300 shadow-lg backdrop-blur-sm transition-all select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
        v{latest.version}
        <span className="text-gray-700">{open?'▲':'▼'}</span>
      </button>
    </div>
  );
}
