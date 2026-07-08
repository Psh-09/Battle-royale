'use client';

import { useState, useCallback } from 'react';
import type { RosterSlot } from '@/types';
import type { AbilityDef } from '@/types';
import { FIGHTER_COLORS } from '@/data/constants';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface RosterBuilderProps { onStart: (slots: RosterSlot[]) => void; }

function generateId() { return Math.random().toString(36).slice(2, 9); }
function makeSlot(index: number): RosterSlot {
  return { id: generateId(), name: `플레이어 ${index + 1}`, color: FIGHTER_COLORS[index % FIGHTER_COLORS.length], imageUrl: null };
}
function makeSlots(n: number): RosterSlot[] { return Array.from({ length: n }, (_, i) => makeSlot(i)); }

// ── 능력 상세 팝업 ────────────────────────────────────────────
function AbilityDetailModal({ ab, onClose }: { ab: AbilityDef; onClose: () => void }) {
  const typeLabel = ab.type === 'auto' ? '⏱ 자동 발동형' : '💥 충돌 발동형';
  const cdSec = (ab.cd / 1000).toFixed(ab.cd % 1000 === 0 ? 0 : 2);
  const dmgText = ab.params.damage
    ? `${ab.params.damage[0]} ~ ${ab.params.damage[1]}`
    : ab.params.dotDamage ? `${ab.params.dotDamage} / 틱` : '–';
  const extras: { label: string; value: string }[] = [];
  if (ab.params.aoeRadius)       extras.push({ label: '범위', value: `${ab.params.aoeRadius}px` });
  if (ab.params.projectileCount) extras.push({ label: '투사체', value: `${ab.params.projectileCount}발` });
  if (ab.params.stunDuration)    extras.push({ label: '감속/스턴', value: `${(ab.params.stunDuration/1000).toFixed(1)}초` });
  if (ab.params.lifeStealRatio)  extras.push({ label: '흡혈', value: `${(ab.params.lifeStealRatio*100).toFixed(0)}%` });
  if (ab.params.chainCount)      extras.push({ label: '연쇄 횟수', value: `${ab.params.chainCount}회` });
  if (ab.params.wallBounces)     extras.push({ label: '벽 튕김', value: `${ab.params.wallBounces}회` });
  const hpDisplay = ab.id === 26 ? '250~450 (랜덤)' : String(ab.maxHp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div className="relative bg-gray-950 border-2 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ borderColor: ab.color + 'bb' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-sm">✕</button>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{ab.emoji}</span>
          <div>
            <div className="text-xl font-black" style={{ color: ab.color }}>{ab.name}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{typeLabel} · 쿨타임 {ab.id === 26 ? '2~5초 랜덤' : `${cdSec}s`}</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mt-3 mb-4 border-t border-gray-800 pt-3">{ab.desc}</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">최대 체력</div>
            <div className="text-xl font-black text-green-400">{hpDisplay}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">공격력</div>
            <div className="text-xl font-black text-red-400">{ab.id === 26 ? '1~999 랜덤' : dmgText}</div>
          </div>
        </div>
        {extras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((ex, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full font-semibold"
                style={{ background: ab.color + '20', color: ab.color, border: `1px solid ${ab.color}44` }}>
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
    <button type="button" onClick={() => onClick(ab)}
      className="text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer select-none hover:shadow-[0_0_8px_currentColor]"
      style={{ background: ab.color + '22', color: ab.color, border: `1px solid ${ab.color}55` }}
      title={`${ab.name} 클릭 시 상세 정보`}>
      {ab.emoji} {ab.name}
    </button>
  );
}

type AbilityMode = 'random' | 'manual';

export default function RosterBuilder({ onStart }: RosterBuilderProps) {
  const [count, setCount] = useState(4);
  const [slots, setSlots] = useState<RosterSlot[]>(() => makeSlots(4));
  const [abilityMode, setAbilityMode] = useState<AbilityMode>('random');
  const [selectedAbilityIds, setSelectedAbilityIds] = useState<(number | null)[]>(() => Array(4).fill(null));
  const [selectedAbility, setSelectedAbility] = useState<AbilityDef | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);

  const changeCount = (n: number) => {
    setCount(n);
    setSlots(prev => n > prev.length
      ? [...prev, ...Array.from({ length: n - prev.length }, (_, i) => makeSlot(prev.length + i))]
      : prev.slice(0, n));
    setSelectedAbilityIds(prev => n > prev.length
      ? [...prev, ...Array(n - prev.length).fill(null)]
      : prev.slice(0, n));
    setDuplicateError(false);
  };

  const updateSlot = useCallback((id: string, patch: Partial<RosterSlot>) =>
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s)), []);

  const handleImageUpload = useCallback((id: string, file: File) =>
    updateSlot(id, { imageUrl: URL.createObjectURL(file) }), [updateSlot]);

  const handleAbilitySelect = (slotIdx: number, value: string) => {
    const id = value === '' ? null : parseInt(value);
    setSelectedAbilityIds(prev => prev.map((v, i) => i === slotIdx ? id : v));
    setDuplicateError(false);
  };

  const handleStart = () => {
    if (slots.some(s => !s.name.trim())) return;

    if (abilityMode === 'manual') {
      // 모든 슬롯에 능력이 선택됐는지 확인
      if (selectedAbilityIds.some(id => id === null)) return;
      const ids = selectedAbilityIds as number[];

      // 중복 확인
      if (new Set(ids).size < ids.length) {
        setDuplicateError(true);
        return;
      }

      // 슬롯에 능력 ID 포함해서 전달
      onStart(slots.map((s, i) => ({ ...s, abilityId: ids[i] })));
    } else {
      onStart(slots);
    }
  };

  const autoAbs = ABILITY_DEFS.filter(a => a.type === 'auto');
  const collAbs = ABILITY_DEFS.filter(a => a.type === 'collision');
  const canStart = slots.every(s => s.name.trim().length > 0) &&
    (abilityMode === 'random' || selectedAbilityIds.every(id => id !== null));

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* 타이틀 */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-widest text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">⚔️ BATTLE ROYALE</h1>
        <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">simulator</p>
      </div>

      {/* 참가 인원 */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">참가 인원 선택</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }, (_, i) => i + 2).map(n => (
            <button key={n} onClick={() => changeCount(n)}
              className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
                count === n
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_10px_rgba(255,215,0,.3)]'
                  : 'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-500 hover:text-gray-300'
              }`}>{n}</button>
          ))}
        </div>
      </div>

      {/* 로스터 설정 */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">로스터 설정</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot, idx) => (
            <div key={slot.id} className="flex items-start gap-3 bg-gray-900 border rounded-lg p-3 transition-all"
              style={{ borderColor: slot.color + '55' }}>
              <label className="cursor-pointer flex-shrink-0">
                <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-800 hover:opacity-80"
                  style={{ borderColor: slot.color }}>
                  {slot.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={slot.imageUrl} alt={slot.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl select-none">
                        {['⚔️','🗡️','🥋','🌀','🦾','💪','🤛','👊','🥊','🦶','🤺','🛡️','🏹','🔱','⚡','🔥'][idx % 16]}
                      </span>}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(slot.id, f); }} />
              </label>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <input type="text" value={slot.name}
                  onChange={e => updateSlot(slot.id, { name: e.target.value })}
                  maxLength={20}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="이름 입력" />
                <div className="flex items-center gap-2">
                  <input type="color" value={slot.color}
                    onChange={e => updateSlot(slot.id, { color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                  <span className="text-[10px] text-gray-600">테두리 색상</span>
                </div>
                {/* 직접 선택 모드: 능력 드롭다운 */}
                {abilityMode === 'manual' && (
                  <select
                    value={selectedAbilityIds[idx] ?? ''}
                    onChange={e => handleAbilitySelect(idx, e.target.value)}
                    className={`w-full text-[11px] rounded px-2 py-1.5 border focus:outline-none transition-colors
                      ${selectedAbilityIds[idx] === null
                        ? 'bg-gray-800 border-gray-600 text-gray-400'
                        : 'bg-gray-800 border-blue-600 text-white'}`}
                  >
                    <option value="">-- 능력 선택 --</option>
                    <optgroup label="⏱ 자동 발동형">
                      {autoAbs.map(ab => (
                        <option key={ab.id} value={ab.id}>
                          {ab.emoji} {ab.name} {ab.id === 26 ? '(HP 랜덤)' : `(HP ${ab.maxHp})`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💥 충돌 발동형">
                      {collAbs.map(ab => (
                        <option key={ab.id} value={ab.id}>
                          {ab.emoji} {ab.name} {ab.id === 26 ? '(HP 랜덤)' : `(HP ${ab.maxHp})`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 능력 배분 방식 선택 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        {/* 모드 토글 */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold flex-1">능력 배분 방식</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              type="button"
              onClick={() => { setAbilityMode('random'); setDuplicateError(false); }}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                abilityMode === 'random'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >🎲 랜덤 배분</button>
            <button
              type="button"
              onClick={() => { setAbilityMode('manual'); setDuplicateError(false); }}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                abilityMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >✋ 직접 선택</button>
          </div>
        </div>

        {abilityMode === 'random' ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-500 italic">능력을 클릭하면 상세 정보를 볼 수 있어요</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wider">⏱ 자동 발동형 ({autoAbs.length}개)</p>
                <div className="flex flex-wrap gap-1.5">
                  {autoAbs.map(ab => <AbilityChip key={ab.id} ab={ab} onClick={setSelectedAbility} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 mb-1.5 font-semibold uppercase tracking-wider">💥 충돌 발동형 ({collAbs.length}개)</p>
                <div className="flex flex-wrap gap-1.5">
                  {collAbs.map(ab => <AbilityChip key={ab.id} ab={ab} onClick={setSelectedAbility} />)}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-700 mt-3 text-center">경기 시작 시 참가 인원 수만큼 중복 없이 무작위 배분</p>
          </>
        ) : (
          <div className="text-[11px] text-gray-400 leading-relaxed">
            각 선수 슬롯의 드롭다운에서 원하는 능력을 선택하세요.
            <span className="text-blue-400"> 능력 중복 선택 시 경기를 시작할 수 없습니다.</span>
          </div>
        )}
      </div>

      {/* 중복 에러 메시지 */}
      {duplicateError && (
        <div className="flex items-center gap-2 bg-red-950/80 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold">능력이 중복되었습니다!</div>
            <div className="text-xs text-red-400 mt-0.5">각 선수는 서로 다른 능력을 가져야 합니다. 드롭다운에서 다시 선택해주세요.</div>
          </div>
        </div>
      )}

      {/* 직접 선택 미완료 안내 */}
      {abilityMode === 'manual' && selectedAbilityIds.some(id => id === null) && (
        <div className="text-center text-[11px] text-gray-500">
          모든 선수의 능력을 선택해야 대전을 시작할 수 있습니다
          ({selectedAbilityIds.filter(id => id !== null).length}/{count} 선택됨)
        </div>
      )}

      {/* 시작 버튼 */}
      <button onClick={handleStart} disabled={!canStart}
        className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg tracking-wide transition-all active:scale-95">
        ⚔️ 전투 시작!
      </button>

      {/* 능력 상세 팝업 */}
      {selectedAbility && <AbilityDetailModal ab={selectedAbility} onClose={() => setSelectedAbility(null)} />}
    </div>
  );
}
