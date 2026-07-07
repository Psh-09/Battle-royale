import type { AbilityDef } from '@/types';

/**
 * maxHp: 능력 강도에 반비례 — 강할수록 낮은 HP(250), 약할수록 높은 HP(480)
 * damage: v1.0.3 과도한 차등 패치 롤백 → v1.0.1 이후 상태로 복원
 *         (단, 필살기 데미지는 150 → 230으로 상향)
 */
export const ABILITY_DEFS: AbilityDef[] = [
  // ── 자동 발동형 (auto) ────────────────────────────────────────
  {
    id: 0,  name: '번개 난사',   emoji: '⚡',  type: 'auto', cd: 16_500, color: '#e040fb',
    desc: '12갈래 지그재그 레이저 광역 피해',
    params: { damage: [42, 60], knockbackMult: 0.35 },
    maxHp: 413,
  },
  {
    id: 2,  name: '유도 미사일', emoji: '🚀',  type: 'auto', cd: 14_000, color: '#ff4444',
    desc: '3발의 열추적 미사일',
    params: { damage: [40, 44], projectileCount: 3, knockbackMult: 0.5 },
    maxHp: 440,
  },
  {
    id: 3,  name: '독 안개',     emoji: '☠️', type: 'auto', cd: 16_000, color: '#44cc55',
    desc: '독성 구름 — 접촉 적에게 지속 피해',
    params: { dotDamage: 8, dotDuration: 3_200, aoeRadius: 72 },
    maxHp: 480,
  },
  {
    id: 4,  name: '회오리',      emoji: '🌪️', type: 'auto', cd: 19_000, color: '#88ccff',
    desc: '이동 회오리 (+2초·범위1.5배·데미지1.7배)',
    params: { damage: [31, 31], knockbackMult: 0.5 },
    maxHp: 471,
  },
  {
    id: 5,  name: '필살기',      emoji: '💀',  type: 'auto', cd: 30_000, color: '#ffffff',
    desc: '30초 쿨타임 — 최근접 적에게 230 대피해',
    params: { damage: [230, 230], knockbackMult: 2.8 },
    maxHp: 325,
  },
  {
    id: 6,  name: '마법 구슬',   emoji: '🔮',  type: 'auto', cd: 13_000, color: '#9b59b6',
    desc: '6개 추적 구슬 발사',
    params: { damage: [20, 20], projectileCount: 6, knockbackMult: 0.4 },
    maxHp: 452,
  },
  {
    id: 7,  name: '저격',        emoji: '🎯',  type: 'auto', cd: 20_000, color: '#00ddff',
    desc: '일직선 레이저 빔으로 모든 적 관통',
    params: { damage: [50, 68], knockbackMult: 0.5 },
    maxHp: 398,
  },
  {
    id: 15, name: '전기장',      emoji: '🌐',  type: 'auto', cd: 18_000, color: '#ffee00',
    desc: '팽창하는 전기장이 접촉 모든 적 피해',
    params: { damage: [22, 30], aoeRadius: 120, knockbackMult: 0.6 },
    maxHp: 462,
  },
  // ── 충돌 발동형 (collision) — 쿨타임 2초 ─────────────────────
  {
    id: 8,  name: '잡아던지기',  emoji: '🤼',  type: 'collision', cd: 2_000, color: '#ff8866',
    desc: '충돌 시 적을 던져 벽에 3회 튕기며 피해',
    params: { damage: [28, 28], wallBounces: 3, knockbackMult: 0 },
    maxHp: 305,
  },
  {
    id: 9,  name: '각성 강타',   emoji: '🐲',  type: 'collision', cd: 2_000, color: '#ff4400',
    desc: '충돌 피해; HP 40% ↓ → 각성으로 능력치 강화',
    params: { damage: [22, 40], knockbackMult: 1.0 },
    maxHp: 280,
  },
  {
    id: 10, name: '화염 강타',   emoji: '🔥',  type: 'collision', cd: 2_000, color: '#ff6022',
    desc: '충돌 시 화염 타격 + 균열 이펙트',
    params: { damage: [28, 40], knockbackMult: 1.1 },
    maxHp: 365,
  },
  {
    id: 11, name: '감전 강타',   emoji: '🌩️', type: 'collision', cd: 2_000, color: '#ffee00',
    desc: '충돌 시 전기 피해 + 일시적 이동 제한',
    params: { damage: [26, 36], knockbackMult: 0.6, stunDuration: 1_300 },
    maxHp: 382,
  },
  {
    id: 12, name: '흡혈 타격',   emoji: '🩸',  type: 'collision', cd: 2_000, color: '#cc0044',
    desc: '충돌 시 적 HP를 흡수하여 자신 회복',
    params: { damage: [28, 38], knockbackMult: 0.8, lifeStealRatio: 0.45 },
    maxHp: 250,
  },
  {
    id: 13, name: '연쇄 번개',   emoji: '⛓️', type: 'collision', cd: 2_000, color: '#00ddff',
    desc: '충돌 후 주변 모든 적에게 연쇄 번개',
    params: { damage: [30, 30], chainCount: 3, knockbackMult: 0.3 },
    maxHp: 345,
  },
  {
    id: 14, name: '폭발 강타',   emoji: '💣',  type: 'collision', cd: 2_000, color: '#ffaa00',
    desc: '충돌 지점에서 폭발 — 근처 모두 피해',
    params: { damage: [22, 32], aoeRadius: 70, knockbackMult: 1.0 },
    maxHp: 427,
  },
];

export function getAbility(id: number): AbilityDef {
  const ab = ABILITY_DEFS.find((a) => a.id === id);
  if (!ab) throw new Error(`Unknown ability id: ${id}`);
  return ab;
}

export const ALL_ABILITY_IDS = ABILITY_DEFS.map((a) => a.id);
