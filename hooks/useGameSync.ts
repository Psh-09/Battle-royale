'use client';

import { useEffect, useRef, useState } from 'react';
import type { Fighter, GameState } from '@/types';
import type { ArenaCanvasHandle } from '@/components/ArenaCanvas/index';

export interface GameSnapshot {
  fighters: Fighter[];
  elapsed: number;
  aliveCount: number;
}

const EMPTY: GameSnapshot = { fighters: [], elapsed: 0, aliveCount: 0 };

export function useGameSync(arenaRef: React.RefObject<ArenaCanvasHandle | null>): GameSnapshot {
  const [snap, setSnap] = useState<GameSnapshot>(EMPTY);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    function frame(ts: number) {
      if (ts - lastRef.current >= 33) {
        lastRef.current = ts;
        const gs: GameState | null | undefined = arenaRef.current?.gsRef.current;
        if (gs) {
          setSnap({
            fighters: [...gs.fighters],
            elapsed: gs.elapsed,
            aliveCount: gs.fighters.filter(f => !f.dead).length,
          });
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [arenaRef]);

  return snap;
}
