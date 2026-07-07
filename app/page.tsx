'use client';

import { useState, useCallback, useRef } from 'react';
import type { Fighter, RosterSlot, EliminationEntry, GameScreen } from '@/types';
import { buildFighters } from '@/engine/init';
import RosterBuilder from '@/components/RosterBuilder/index';
import ArenaCanvas, { type ArenaCanvasHandle } from '@/components/ArenaCanvas/index';
import HpRail from '@/components/HpRail/index';
import GameControls from '@/components/GameControls/index';
import WinnerOverlay from '@/components/WinnerOverlay/index';
import EliminationToast from '@/components/EliminationToast/index';
import AbilityInfoModal from '@/components/AbilityInfoModal/index';
import { useGameSync } from '@/hooks/useGameSync';

function fmt(ms:number){const s=Math.floor(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>('roster');
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [pendingSlots, setPendingSlots] = useState<RosterSlot[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);
  const [eliminations, setEliminations] = useState<EliminationEntry[]>([]);
  const [winner, setWinner] = useState<Fighter | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [tooltipFighter, setTooltipFighter] = useState<Fighter | null>(null);

  const arenaRef = useRef<ArenaCanvasHandle>(null);
  const snap = useGameSync(arenaRef);

  const handleStart = useCallback(async (slots: RosterSlot[]) => {
    setPendingSlots(slots);
    const fs=Math.max(300,Math.min(window.innerWidth-32,window.innerHeight-240,620));
    const built=await buildFighters(slots,fs);
    setFighters(built);setEliminations([]);setWinner(null);setIsPaused(false);
    setScreen('playing');setGameKey(k=>k+1);
  },[]);

  const handleRestart = useCallback(async () => {
    if (!pendingSlots.length) return;
    const fs=Math.max(300,Math.min(window.innerWidth-32,window.innerHeight-240,620));
    const built=await buildFighters(pendingSlots,fs);
    setFighters(built);setEliminations([]);setWinner(null);setIsPaused(false);
    setScreen('playing');setGameKey(k=>k+1);
  },[pendingSlots]);

  const handleNewRoster=useCallback(()=>{setScreen('roster');setFighters([]);setEliminations([]);setWinner(null);setIsPaused(false);},[]);
  const handleElimination=useCallback((entry:EliminationEntry)=>setEliminations(prev=>[...prev,entry]),[]);
  const handleGameOver=useCallback((w:Fighter|null)=>{setWinner(w);setScreen('results');},[]);

  if (screen==='roster') return(
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start py-10 px-4">
      <RosterBuilder onStart={handleStart}/>
    </main>
  );

  const displayFighters=(snap.fighters.length?snap.fighters:fighters) as Fighter[];
  const aliveCount=snap.aliveCount>0?snap.aliveCount:displayFighters.filter(f=>!f.dead).length;

  return(
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start py-4 px-4 gap-3">
      <div className="w-full max-w-2xl flex justify-between items-center">
        <span className="text-yellow-400 font-bold text-lg font-mono">⏱ {fmt(snap.elapsed)}</span>
        <span className="text-gray-500 text-sm">생존 <span className="text-green-400 font-bold">{aliveCount}</span> / {fighters.length}</span>
      </div>
      <div className="relative w-full max-w-2xl">
        <ArenaCanvas key={gameKey} ref={arenaRef} fighters={fighters} isPaused={isPaused} speedMult={speedMult} onElimination={handleElimination} onGameOver={handleGameOver} onFighterClick={setTooltipFighter}/>
        {screen==='results'&&<WinnerOverlay winner={winner} elapsed={snap.elapsed} eliminations={eliminations} fighters={displayFighters} onRestart={handleRestart} onNewRoster={handleNewRoster}/>}
      </div>
      <div className="w-full max-w-2xl"><HpRail fighters={displayFighters}/></div>
      <div className="w-full max-w-2xl"><GameControls isPaused={isPaused} speedMult={speedMult} aliveCount={aliveCount} totalCount={fighters.length} onPause={()=>setIsPaused(true)} onResume={()=>setIsPaused(false)} onRestart={handleRestart} onNewRoster={handleNewRoster} onSpeedChange={setSpeedMult}/></div>
      <EliminationToast eliminations={eliminations}/>
      <AbilityInfoModal fighter={tooltipFighter} onClose={()=>setTooltipFighter(null)}/>
    </main>
  );
}
