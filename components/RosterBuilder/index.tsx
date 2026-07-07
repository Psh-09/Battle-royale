'use client';

import { useState, useCallback } from 'react';
import type { RosterSlot } from '@/types';
import type { AbilityDef } from '@/types';
import { FIGHTER_COLORS } from '@/data/constants';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface RosterBuilderProps { onStart: (slots: RosterSlot[]) => void; }

function generateId() { return Math.random().toString(36).slice(2,9); }
function makeSlot(index: number): RosterSlot {
  return { id:generateId(), name:`플레이어 ${index+1}`, color:FIGHTER_COLORS[index%FIGHTER_COLORS.length], imageUrl:null };
}
function makeSlots(n: number): RosterSlot[] { return Array.from({length:n},(_,i)=>makeSlot(i)); }

// ── 능력 상세 모달 ───────────────────────────────────────────
function AbilityDetailModal({ ab, onClose }: { ab: AbilityDef; onClose: () => void }) {
  const typeLabel = ab.type === 'auto' ? '⏱ 자동 발동형' : '💥 충돌 발동형';
  const cdSec = (ab.cd / 1000).toFixed(ab.cd % 1000 === 0 ? 0 : 2);

  const dmgText = ab.params.damage
    ? `${ab.params.damage[0]} ~ ${ab.params.damage[1]}`
    : ab.params.dotDamage
    ? `${ab.params.dotDamage} / 틱`
    : '–';

  const extras: { label: string; value: string }[] = [];
  if (ab.params.aoeRadius)       extras.push({ label: '범위', value: `${ab.params.aoeRadius}px` });
  if (ab.params.projectileCount) extras.push({ label: '투사체', value: `${ab.params.projectileCount}발` });
  if (ab.params.stunDuration)    extras.push({ label: '감속/스턴', value: `${(ab.params.stunDuration/1000).toFixed(1)}초` });
  if (ab.params.lifeStealRatio)  extras.push({ label: '흡혈', value: `${(ab.params.lifeStealRatio*100).toFixed(0)}%` });
  if (ab.params.chainCount)      extras.push({ label: '연쇄 횟수', value: `${ab.params.chainCount}회` });
  if (ab.params.wallBounces)     extras.push({ label: '벽 튕김', value: `${ab.params.wallBounces}회` });
  if (ab.params.dotDamage)       extras.push({ label: '틱 간격', value: '0.5초' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      {/* modal card */}
      <div
        className="relative bg-gray-950 border-2 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ borderColor: ab.color + 'bb' }}
        onClick={e => e.stopPropagation()}
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-sm"
        >
          ✕
        </button>

        {/* header */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{ab.emoji}</span>
          <div>
            <div className="text-xl font-black" style={{ color: ab.color }}>{ab.name}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{typeLabel} · 쿨타임 {cdSec}s</div>
          </div>
        </div>

        {/* description */}
        <p className="text-sm text-gray-300 leading-relaxed mt-3 mb-4 border-t border-gray-800 pt-3">
          {ab.desc}
        </p>

        {/* stat grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">최대 체력</div>
            <div className="text-2xl font-black text-green-400">{ab.maxHp}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">공격력</div>
            <div className="text-xl font-black text-red-400">{dmgText}</div>
          </div>
        </div>

        {/* extra params */}
        {extras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((ex, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-1 rounded-full font-semibold"
                style={{
                  background: ab.color + '20',
                  color: ab.color,
                  border: `1px solid ${ab.color}44`,
                }}
              >
                {ex.label}: {ex.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 능력 칩 버튼 ─────────────────────────────────────────────
function AbilityChip({ ab, onClick }: { ab: AbilityDef; onClick: (ab: AbilityDef) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(ab)}
      className="text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all
        hover:scale-105 active:scale-95 cursor-pointer select-none
        hover:shadow-[0_0_8px_currentColor]"
      style={{
        background: ab.color + '22',
        color: ab.color,
        border: `1px solid ${ab.color}55`,
      }}
      title={`${ab.name} 클릭 시 상세 정보 확인`}
    >
      {ab.emoji} {ab.name}
    </button>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function RosterBuilder({ onStart }: RosterBuilderProps) {
  const [count, setCount] = useState(4);
  const [slots, setSlots] = useState<RosterSlot[]>(() => makeSlots(4));
  const [selectedAbility, setSelectedAbility] = useState<AbilityDef | null>(null);

  const changeCount = (n: number) => {
    setCount(n);
    setSlots(prev =>
      n > prev.length
        ? [...prev, ...Array.from({ length: n - prev.length }, (_, i) => makeSlot(prev.length + i))]
        : prev.slice(0, n)
    );
  };

  const updateSlot = useCallback(
    (id: string, patch: Partial<RosterSlot>) =>
      setSlots(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s))),
    []
  );

  const handleImageUpload = useCallback(
    (id: string, file: File) => updateSlot(id, { imageUrl: URL.createObjectURL(file) }),
    [updateSlot]
  );

  const autoAbs = ABILITY_DEFS.filter(a => a.type === 'auto');
  const collAbs = ABILITY_DEFS.filter(a => a.type === 'collision');

  const canStart = slots.every(s => s.name.trim().length > 0);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* title */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-widest text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
          ⚔️ BATTLE ROYALE
        </h1>
        <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">simulator</p>
      </div>

      {/* count selector */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">참가 인원 선택</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }, (_, i) => i + 2).map(n => (
            <button
              key={n}
              onClick={() => changeCount(n)}
              className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all
                ${count === n
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_10px_rgba(255,215,0,.3)]'
                  : 'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* roster slots */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">로스터 설정</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot, idx) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 bg-gray-900 border rounded-lg p-3 transition-all"
              style={{ borderColor: slot.color + '55' }}
            >
              <label className="cursor-pointer flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-800 hover:opacity-80"
                  style={{ borderColor: slot.color }}
                >
                  {slot.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.imageUrl} alt={slot.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl select-none">
                      {['⚔️','🗡️','🥋','🌀','🦾','💪','🤛','👊','🥊','🦶','🤺','🛡️','🏹','🔱','⚡','🔥'][idx % 16]}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(slot.id, f); }}
                />
              </label>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={slot.name}
                  onChange={e => updateSlot(slot.id, { name: e.target.value })}
                  maxLength={20}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white
                    focus:outline-none focus:border-blue-500"
                  placeholder="이름 입력"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slot.color}
                    onChange={e => updateSlot(slot.id, { color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[10px] text-gray-600">테두리 색상</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ability list — 클릭하면 상세 팝업 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
            전체 능력 목록
          </p>
          <span className="text-[10px] text-gray-600 italic">클릭하면 상세 정보를 볼 수 있어요</span>
        </div>

        <div className="flex flex-col gap-3">
          {/* 자동 발동형 */}
          <div>
            <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wider">
              ⏱ 자동 발동형 ({autoAbs.length}개)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {autoAbs.map(ab => (
                <AbilityChip key={ab.id} ab={ab} onClick={setSelectedAbility} />
              ))}
            </div>
          </div>

          {/* 충돌 발동형 */}
          <div>
            <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wider">
              💥 충돌 발동형 ({collAbs.length}개)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {collAbs.map(ab => (
                <AbilityChip key={ab.id} ab={ab} onClick={setSelectedAbility} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-700 mt-3 text-center">
          경기 시작 시 참가 인원 수만큼 중복 없이 무작위 배분됩니다
        </p>
      </div>

      {/* start button */}
      <button
        onClick={() => { if (canStart) onStart(slots); }}
        disabled={!canStart}
        className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400
          disabled:opacity-40 disabled:cursor-not-allowed
          text-white font-black text-lg tracking-wide transition-all active:scale-95"
      >
        ⚔️ 전투 시작!
      </button>

      {/* ability detail modal */}
      {selectedAbility && (
        <AbilityDetailModal ab={selectedAbility} onClose={() => setSelectedAbility(null)} />
      )}
    </div>
  );
}
