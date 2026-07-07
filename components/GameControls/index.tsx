'use client';

interface GameControlsProps {
  isPaused: boolean; speedMult: number; aliveCount: number; totalCount: number;
  onPause:()=>void; onResume:()=>void; onRestart:()=>void; onNewRoster:()=>void; onSpeedChange:(m:number)=>void;
}

export default function GameControls({isPaused,speedMult,aliveCount,totalCount,onPause,onResume,onRestart,onNewRoster,onSpeedChange}:GameControlsProps){
  return(
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="text-sm font-bold text-gray-300">생존 <span className="text-green-400">{aliveCount}</span><span className="text-gray-600"> / {totalCount}</span></div>
      <div className="flex gap-1">
        {[1,2,4].map(s=>(
          <button key={s} onClick={()=>onSpeedChange(s)} className={`px-3 py-1 text-xs font-bold rounded border transition-all ${speedMult===s?'bg-yellow-400 text-black border-yellow-400':'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300'}`}>{s}×</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={isPaused?onResume:onPause} className="px-3 py-1.5 text-xs font-bold rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all active:scale-95">{isPaused?'▶ 계속':'⏸ 일시정지'}</button>
        <button onClick={onRestart} className="px-3 py-1.5 text-xs font-bold rounded bg-blue-600 border border-blue-500 text-white hover:bg-blue-500 transition-all active:scale-95">🔄 재시작</button>
        <button onClick={onNewRoster} className="px-3 py-1.5 text-xs font-bold rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 transition-all active:scale-95">🏠 새로 만들기</button>
      </div>
    </div>
  );
}
