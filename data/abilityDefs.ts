import type { AbilityDef } from '@/types';

export const ABILITY_DEFS: AbilityDef[] = [
  // ── 자동 발동형 (auto) — 쿨타임 전체 ×0.85 적용 ──────────────
  {
    id: 0,  name: '번개 난사',   emoji: '⚡',  type: 'auto', cd: 14_000, color: '#e040fb',
    desc: '20갈래 지그재그 레이저 광역 피해 (기존 12→20발)',
    params: { damage: [42, 60], knockbackMult: 0.35 },
    maxHp: 350, // 빔 1.7배 + CD 단축 반영
  },
  {
    id: 2,  name: '유도 미사일', emoji: '🚀',  type: 'auto', cd: 12_000, color: '#ff4444',
    desc: '3발의 열추적 미사일',
    params: { damage: [40, 44], projectileCount: 3, knockbackMult: 0.5 },
    maxHp: 420,
  },
  {
    id: 3,  name: '독 안개',     emoji: '☠️', type: 'auto', cd: 13_500, color: '#44cc55',
    desc: '독성 구름 — 접촉 적에게 지속 피해',
    params: { dotDamage: 8, dotDuration: 3_200, aoeRadius: 144 }, // 범위 ×2
    maxHp: 430, // 범위 2배 버프 반영
  },
  {
    id: 4,  name: '회오리',      emoji: '🌪️', type: 'auto', cd: 16_000, color: '#88ccff',
    desc: '이동 회오리 (+2초·범위1.5배·데미지1.7배)',
    params: { damage: [31, 31], knockbackMult: 0.5 },
    maxHp: 460,
  },
  {
    id: 5,  name: '필살기',      emoji: '💀',  type: 'auto', cd: 25_500, color: '#ffffff',
    desc: '25.5초 쿨타임 — 최근접 적에게 300 대피해',
    params: { damage: [300, 300], knockbackMult: 2.8 },
    maxHp: 280, // 데미지 300 + CD 단축 반영
  },
  {
    id: 6,  name: '마법 구슬',   emoji: '🔮',  type: 'auto', cd: 11_000, color: '#9b59b6',
    desc: '6개 추적 구슬 발사',
    params: { damage: [20, 20], projectileCount: 6, knockbackMult: 0.4 },
    maxHp: 430,
  },
  {
    id: 7,  name: '저격',        emoji: '🎯',  type: 'auto', cd: 17_000, color: '#00ddff',
    desc: '일직선 레이저 빔으로 모든 적 관통',
    params: { damage: [50, 68], knockbackMult: 0.5 },
    maxHp: 380,
  },
  {
    id: 15, name: '전기장',      emoji: '🌐',  type: 'auto', cd: 15_000, color: '#ffee00',
    desc: '팽창하는 전기장이 접촉 모든 적 피해',
    params: { damage: [22, 30], aoeRadius: 180, knockbackMult: 0.6 }, // 범위 ×1.5
    maxHp: 420, // 범위 1.5배 버프 반영
  },
  // ── 충돌 발동형 (collision) — 쿨타임 2초 ─────────────────────
  {
    id: 8,  name: '잡아던지기',  emoji: '🤼',  type: 'collision', cd: 3_000, color: '#ff8866',
    desc: '충돌 시 적을 던져 벽에 3회 튕기며 피해 (쿨타임 3초)',
    params: { damage: [28, 28], wallBounces: 3, knockbackMult: 0 },
    maxHp: 310,
  },
  {
    id: 9,  name: '각성 강타',   emoji: '🐲',  type: 'collision', cd: 2_000, color: '#ff4400',
    desc: '충돌 피해; HP 40% ↓ → 각성+쿨타임 0.5s·데미지 ×1.35',
    params: { damage: [37, 65], knockbackMult: 1.0 }, // ×1.35 버프 적용
    maxHp: 280,
  },
  {
    id: 10, name: '화염 강타',   emoji: '🔥',  type: 'collision', cd: 2_000, color: '#ff6022',
    desc: '충돌 시 화염 타격 + 균열 이펙트',
    params: { damage: [38, 54], knockbackMult: 1.1 },
    maxHp: 360,
  },
  {
    id: 11, name: '감전 강타',   emoji: '🌩️', type: 'collision', cd: 2_000, color: '#ffee00',
    desc: '충돌 시 전기 피해 + 일시적 이동 제한',
    params: { damage: [30, 42], knockbackMult: 0.6, stunDuration: 1_300 },
    maxHp: 380,
  },
  {
    id: 12, name: '흡혈 타격',   emoji: '🩸',  type: 'collision', cd: 1_000, color: '#cc0044',
    desc: '충돌 시 적 HP를 흡수 (피해의 70% 회복, 쿨타임 1초)',
    params: { damage: [43, 59], knockbackMult: 0.8, lifeStealRatio: 0.70 }, // ×1.2 버프
    maxHp: 250,
  },
  {
    id: 13, name: '연쇄 번개',   emoji: '⛓️', type: 'collision', cd: 2_000, color: '#00ddff',
    desc: '충돌 후 주변 모든 적에게 연쇄 번개',
    params: { damage: [38, 38], chainCount: 3, knockbackMult: 0.3 },
    maxHp: 340,
  },
  {
    id: 14, name: '폭발 강타',   emoji: '💣',  type: 'collision', cd: 2_000, color: '#ffaa00',
    desc: '충돌 지점에서 폭발 — 근처 모두 피해',
    params: { damage: [31, 45], aoeRadius: 70, knockbackMult: 1.0 },
    maxHp: 430,
  },
  // ── 신규 능력 (IDs 16-25) — CD ×0.85 적용 ──────────────────
  { id:16, name:'벌집 지뢰',   emoji:'🐝', type:'auto', cd:13_000, color:'#ffaa00',
    desc:'설치 지점 범위 내 모든 적에게 5초간 지속 피해 (범위 ×1.5)', maxHp:380,
    params:{ dotDamage:10, aoeRadius:97 } }, // 범위 ×1.5, 지속 5s, HP 버프 반영
  { id:17, name:'환영의 역습', emoji:'🌀', type:'auto', cd:21_000, color:'#cc88ff',
    desc:'1.5초 무적+잔상 후 근처 적에게 연속 투사체 3발', maxHp:260,
    params:{ damage:[45,65], projectileCount:3, knockbackMult:0.8 } },
  { id:18, name:'해일 강타',   emoji:'🌊', type:'auto', cd:19_000, color:'#0088ff',
    desc:'필드 한쪽에서 반대쪽으로 물결이 쓸어가며 피해+넉백', maxHp:310,
    params:{ damage:[48,62], knockbackMult:1.5 } },
  { id:19, name:'곡사 투척',   emoji:'🪃', type:'auto', cd:11_000, color:'#88cc44',
    desc:'포물선 궤도로 가장 먼 적을 향해 투사체 투척+스플래시', maxHp:430,
    params:{ damage:[45,60], aoeRadius:40, knockbackMult:0.7 } },
  { id:20, name:'서리 투척',   emoji:'❄️', type:'auto', cd:9_500, color:'#88ddff',
    desc:'얼음 투사체 명중 시 데미지+이동속도 2초 감소', maxHp:430,
    params:{ damage:[32,42], knockbackMult:0.5, stunDuration:2_000 } },
  { id:21, name:'균열 강타',   emoji:'⚡', type:'collision', cd:2_000, color:'#aa8866',
    desc:'충돌 시 땅 갈라짐 이펙트+데미지 (최중량급)',
    params:{ damage:[49,70], knockbackMult:1.0 }, maxHp:390 },
  { id:22, name:'딸기 폭격',   emoji:'🍓', type:'auto', cd:12_750, color:'#ff4466',
    desc:'넓은 범위에 10발의 투사체가 쏟아짐 (중복 피격 가능)', maxHp:300,
    params:{ damage:[40,55], projectileCount:10, knockbackMult:0.6 } },
  { id:23, name:'그림자 결박', emoji:'🕸️', type:'auto', cd:14_000, color:'#442266',
    desc:'근처 적을 사슬로 묶어 3초 감속+도트 피해 (지속 ×2)', maxHp:310,
    params:{ dotDamage:8, stunDuration:3_000 } }, // 지속 ×2, HP 버프 반영
  { id:24, name:'지뢰 매설',   emoji:'💥', type:'auto', cd:15_000, color:'#887700',
    desc:'랜덤 3곳에 지뢰 투척 — 접근 즉시 또는 1.5초 후 자동 폭발 (범위 ×1.3)', maxHp:360,
    params:{ damage:[65,80], aoeRadius:91 } }, // 3개 투척+범위 ×1.3, HP 버프 반영
  // id:25 관통사격 제거됨
  {
    id: 26, name: '도박꾼', emoji: '🎲', type: 'collision', cd: 500, color: '#ff9900',
    desc: '충돌 시 랜덤 데미지(1~999, 지수 감소 확률) + 랜덤 쿨타임(0.5~4초). HP도 랜덤(250~450)',
    params: { damage: [1, 999], knockbackMult: 0.7 },
    maxHp: 350, // 로비 표시용 대표값 — 실제 fighter HP는 getGamblerHp()로 랜덤 배정
  },
];

// ─── 도박꾼 전용 확률 함수 ─────────────────────────────────────

/**
 * 슬롯머신 데미지 산출 (3자리 숫자: 000~999)
 *
 * [첫 번째 자리 - 百의 자리 특수 분포]
 * 0:70%, 1:20%, 2:5%, 3:3%, 4:1%, 5-9: 나머지 1% 지수 감소 (비율 1/2)
 * 5:16/31%, 6:8/31%, 7:4/31%, 8:2/31%, 9:1/31%  →  p1(9) ≈ 0.0323%
 *
 * [두/세 번째 자리 - 공통 지수 감소 r=0.9]
 * P(d) ∝ 0.9^d, 정규화 sum≈6.513
 * P(0)≈15.4%, P(9)≈5.94%
 * 수학적 주의: p2=p3 이론값≈55.7% (P(999)=0.01% 조건) → 불가능 (역감소 분포됨)
 * 실제 구현은 자연스러운 r=0.9 사용, 실제 P(999)≈0.000113%
 *
 * 고데미지 빈도: 너프버전(5.1%) < 슬롯머신(≈17%) < 최초버전(35.7%) ✓
 */

// 첫 번째 자리 가중치 (0~9)
const REEL1_W = [
  70, 20, 5, 3, 1,
  16/31, 8/31, 4/31, 2/31, 1/31  // 5-9: 합=1%, 비율=1/2씩 감소
];
// 두/세 번째 자리 가중치 (r=0.9 기하분포)
const REEL23_W = [1, 0.9, 0.81, 0.729, 0.6561, 0.59049, 0.531441, 0.478297, 0.430467, 0.387421];

function rollFromWeights(weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return i;
  }
  return weights.length - 1;
}

/** 슬롯머신 3자리를 한 번에 결정 */
export function rollSlotDamage(): { digits: [number, number, number]; damage: number } {
  const d0 = rollFromWeights(REEL1_W);
  const d1 = rollFromWeights(REEL23_W);
  const d2 = rollFromWeights(REEL23_W);
  const raw = d0 * 100 + d1 * 10 + d2;
  const damage = Math.max(1, raw); // 000이면 1로 보정
  return { digits: [d0, d1, d2], damage };
}

/** @deprecated 이전 단일 데미지 산출 (호환성 유지) */
export function getWeightedDamage(): number {
  return rollSlotDamage().damage;
}

/**
 * 체력 분포: 250~450, 10 단위, 선형 감소 (250이 가장 높고 450이 가장 낮음)
 * 가중치: [21, 20, 19, ..., 2, 1] (i번째 후보 = 250+10i, 가중치 = 21-i)
 * 합계 = 231, P(250) ≈ 9.1%, P(450) ≈ 0.43%
 */
export function getGamblerHp(): number {
  const totalWeight = 231; // 21×22/2
  let rand = Math.random() * totalWeight;
  for (let i = 0; i <= 20; i++) {
    rand -= (21 - i);
    if (rand <= 0) return 250 + i * 10;
  }
  return 450;
}

export function getAbility(id: number): AbilityDef {
  const ab = ABILITY_DEFS.find((a) => a.id === id);
  if (!ab) throw new Error(`Unknown ability id: ${id}`);
  return ab;
}

export const ALL_ABILITY_IDS = ABILITY_DEFS.map((a) => a.id);
