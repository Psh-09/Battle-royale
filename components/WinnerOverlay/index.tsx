'use client';

import type { Fighter, EliminationEntry } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface WinnerOverlayProps {
  winner: Fighter | null;
  elapsed: number;
  eliminations: EliminationEntry[];
  fighters: readonly Fighter[];  // 딜량 표용
  onRestart: () => void;
  onNewRoster: () => void;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function WinnerOverlay({ winner, elapsed, eliminations, fighters, onRestart, onNewRoster }: WinnerOverlayProps) {
  const rankList = [
    ...(winner ? [{ name: winner.name, color: winner.color, rank: 1 }] : []),
    ...[...eliminations].sort((a, b) => a.rank - b.rank).reverse().map(e => ({ name: e.name, color: e.color, rank: e.rank })),
  ].sort((a, b) => a.rank - b.rank);

  // 딜량 표: 모든 참가자 정렬
  const damageRank = [...fighters]
    .sort((a, b) => b.totalDamageDealt - a.totalDamageDealt);

  const dmgMedals = ['🥇', '🥈', '🥉'];

  return (
    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 rounded-md z-50 overflow-y-auto py-4">
      {/* 승리 발표 */}
      <div
        className="text-4xl font-black tracking-widest animate-[vpop_.5s_cubic-bezier(.34,1.56,.64,1)_both] shrink-0"
        style={{ color: winner?.color ?? '#fff', textShadow: `0 0 30px ${winner?.color ?? '#fff'}` }}
      >
        {winner ? `🏆 ${winner.name} 승리!` : '🤝 무승부!'}
      </div>

      <div className="text-sm text-gray-500 shrink-0">경과: {fmt(elapsed)}</div>

      <div className="flex gap-3 w-full max-w-lg px-2 shrink-0">
        {/* 최종 순위 */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">🏆 최종 순위</p>
          <div className="flex flex-col gap-1.5">
            {rankList.map(r => (
              <div key={r.rank} className="flex items-center gap-2">
                <span className="text-base w-6 text-center shrink-0">
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `${r.rank}`}
                </span>
                <span className="font-bold text-sm" style={{ color: r.color }}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 딜량 표 */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">💥 딜량 순위</p>
          <div className="flex flex-col gap-1.5">
            {damageRank.map((f, i) => {
              const ab = ABILITY_DEFS.find(a => a.id === f.abilityId);
              return (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm shrink-0">{dmgMedals[i] ?? `${i+1}.`}</span>
                    <span className="text-xs" style={{ color: f.color }}>
                      {ab?.emoji} {f.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-yellow-400 tabular-nums">
                    {f.totalDamageDealt.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 shrink-0">
        <button
          onClick={onRestart}
          className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all active:scale-95"
        >
          🔄 다시 대전
        </button>
        <button
          onClick={onNewRoster}
          className="px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-all active:scale-95"
        >
          🏠 새로 만들기
        </button>
      </div>
    </div>
  );
}
