'use client';

import type { Fighter, EliminationEntry } from '@/types';

interface WinnerOverlayProps {
  winner: Fighter | null; elapsed: number; eliminations: EliminationEntry[];
  onRestart:()=>void; onNewRoster:()=>void;
}

function fmt(ms:number){const s=Math.floor(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}

export default function WinnerOverlay({winner,elapsed,eliminations,onRestart,onNewRoster}:WinnerOverlayProps){
  const rankList=[
    ...(winner?[{name:winner.name,color:winner.color,rank:1}]:[]),
    ...[...eliminations].sort((a,b)=>a.rank-b.rank).reverse().map(e=>({name:e.name,color:e.color,rank:e.rank})),
  ].sort((a,b)=>a.rank-b.rank);

  return(
    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-5 rounded-md z-50">
      <div className="text-4xl font-black tracking-widest animate-[vpop_.5s_cubic-bezier(.34,1.56,.64,1)_both]" style={{color:winner?.color??'#fff',textShadow:`0 0 30px ${winner?.color??'#fff'}`}}>
        {winner?`🏆 ${winner.name} 승리!`:'🤝 무승부!'}
      </div>
      <div className="text-sm text-gray-500">경과: {fmt(elapsed)}</div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 w-full max-w-xs">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">최종 순위</p>
        <div className="flex flex-col gap-2">
          {rankList.map(r=>(
            <div key={r.rank} className="flex items-center gap-3">
              <span className="text-lg w-8 text-center">{r.rank===1?'🥇':r.rank===2?'🥈':r.rank===3?'🥉':`${r.rank}위`}</span>
              <span className="font-bold text-sm" style={{color:r.color}}>{r.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all active:scale-95">🔄 다시 대전</button>
        <button onClick={onNewRoster} className="px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-all active:scale-95">🏠 새로 만들기</button>
      </div>
    </div>
  );
}
