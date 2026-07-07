'use client';

import { useEffect, useState } from 'react';
import type { EliminationEntry } from '@/types';

interface EliminationToastProps { eliminations: EliminationEntry[]; }
interface Toast extends EliminationEntry { toastId: string; visible: boolean; }

export default function EliminationToast({ eliminations }: EliminationToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    for (const e of eliminations) {
      const key = e.fighterId + e.time;
      if (seen.has(key)) continue;
      setSeen(s => new Set(s).add(key));
      const toast: Toast = { ...e, toastId: Math.random().toString(36).slice(2), visible: true };
      setToasts(t => [...t, toast]);
      setTimeout(() => {
        setToasts(t => t.map(tt => tt.toastId===toast.toastId?{...tt,visible:false}:tt));
        setTimeout(() => setToasts(t => t.filter(tt => tt.toastId!==toast.toastId)), 400);
      }, 3_000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eliminations]);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.toastId} className={`flex items-center gap-2 bg-gray-900/95 border rounded-lg px-3 py-2 shadow-xl transition-all duration-300 ${t.visible?'opacity-100 translate-x-0':'opacity-0 translate-x-8'}`} style={{borderColor:t.color+'66'}}>
          <span className="text-lg">💀</span>
          <div><span className="font-bold text-sm" style={{color:t.color}}>{t.name}</span><span className="text-gray-400 text-xs"> 탈락 ({t.rank}위)</span></div>
        </div>
      ))}
    </div>
  );
}
