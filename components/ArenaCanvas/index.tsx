'use client';

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { Fighter, GameState, GameCallbacks, EliminationEntry } from '@/types';
import { initGameState } from '@/engine/init';
import { stepGameState } from '@/engine/gameLoop';
import { renderFrame } from '@/engine/render/index';

export interface ArenaCanvasHandle {
  gsRef: React.MutableRefObject<GameState | null>;
}

interface ArenaCanvasProps {
  fighters: Fighter[];
  isPaused: boolean;
  speedMult: number;
  onElimination: (entry: EliminationEntry) => void;
  onGameOver: (winner: Fighter | null) => void;
  onFighterClick?: (fighter: Fighter) => void;
}

const ArenaCanvas = forwardRef<ArenaCanvasHandle, ArenaCanvasProps>(function ArenaCanvas(
  { fighters, isPaused, speedMult, onElimination, onGameOver, onFighterClick }, ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const isPausedRef = useRef(isPaused);
  const speedRef = useRef(speedMult);

  useImperativeHandle(ref, () => ({ gsRef }), []);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { speedRef.current = speedMult; }, [speedMult]);

  const cbsRef = useRef<GameCallbacks>({ onElimination, onGameOver });
  cbsRef.current = { onElimination, onGameOver };

  const stableCbs: GameCallbacks = {
    onElimination: useCallback((e: EliminationEntry) => cbsRef.current.onElimination(e), []),
    onGameOver: useCallback((w: Fighter | null) => cbsRef.current.onGameOver(w), []),
  };

  function getFieldSize(): number {
    const wrapper = canvasRef.current?.parentElement;
    if (!wrapper) return 500;
    return Math.max(300, Math.floor(Math.min(wrapper.clientWidth, window.innerHeight-240, 620)));
  }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const fieldSize = getFieldSize();
    canvas.width = fieldSize; canvas.height = fieldSize;
    gsRef.current = initGameState(fighters, fieldSize);
    const ctx = canvas.getContext('2d')!;

    function loop(ts: number) {
      const gs = gsRef.current!;
      if (!isPausedRef.current && !gs.gameOver) stepGameState(gs, stableCbs, ts, speedRef.current);
      else gs.lastTs = ts;
      renderFrame(ctx, gs);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas||!gsRef.current) return;
        const fs=getFieldSize(),ratio=fs/gsRef.current.fieldSize;
        canvas.width=fs;canvas.height=fs;
        const r=gsRef.current.baseR*(fs/500);
        gsRef.current.fieldSize=fs;
        for(const f of gsRef.current.fighters){
          f.x=Math.max(r,Math.min(fs-r,f.x*ratio));f.y=Math.max(r,Math.min(fs-r,f.y*ratio));
          f.vx*=ratio;f.vy*=ratio;f.kbVx*=ratio;f.kbVy*=ratio;
        }
      },160);
    };
    window.addEventListener('resize',onResize);

    // 캔버스 클릭 → 능력 정보 팝업
    const handleClick = (e: MouseEvent) => {
      const gs = gsRef.current; if (!gs || !onFighterClick) return;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (gs.fieldSize / rect.width);
      const cy = (e.clientY - rect.top)  * (gs.fieldSize / rect.height);
      const r2 = gs.baseR * (gs.fieldSize / 500);
      const hit = gs.fighters.find(f => !f.dead && Math.hypot(f.x-cx, f.y-cy) < r2 * 1.6);
      if (hit) onFighterClick({ ...hit });
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',onResize);
      canvas.removeEventListener('click', handleClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fighters]);

  return <canvas ref={canvasRef} className="block w-full h-auto rounded-md" style={{maxWidth:620}} />;
});

export default ArenaCanvas;
