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
    maxHp: 410,
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
    maxHp: 470,
  },
  {
    id: 5,  name: '필살기',      emoji: '💀',  type: 'auto', cd: 30_000, color: '#ffffff',
    desc: '30초 쿨타임 — 최근접 적에게 230 대피해',
    params: { damage: [230, 230], knockbackMult: 2.8 },
    maxHp: 320,
  },
  {
    id: 6,  name: '마법 구슬',   emoji: '🔮',  type: 'auto', cd: 13_000, color: '#9b59b6',
    desc: '6개 추적 구슬 발사',
    params: { damage: [20, 20], projectileCount: 6, knockbackMult: 0.4 },
    maxHp: 450,
  },
  {
    id: 7,  name: '저격',        emoji: '🎯',  type: 'auto', cd: 20_000, color: '#00ddff',
    desc: '일직선 레이저 빔으로 모든 적 관통',
    params: { damage: [50, 68], knockbackMult: 0.5 },
    maxHp: 400,
  },
  {
    id: 15, name: '전기장',      emoji: '🌐',  type: 'auto', cd: 18_000, color: '#ffee00',
    desc: '팽창하는 전기장이 접촉 모든 적 피해',
    params: { damage: [22, 30], aoeRadius: 120, knockbackMult: 0.6 },
    maxHp: 460,
  },
  // ── 충돌 발동형 (collision) — 쿨타임 2초 ─────────────────────
  {
    id: 8,  name: '잡아던지기',  emoji: '🤼',  type: 'collision', cd: 2_000, color: '#ff8866',
    desc: '충돌 시 적을 던져 벽에 3회 튕기며 피해',
    params: { damage: [28, 28], wallBounces: 3, knockbackMult: 0 },
    maxHp: 310,
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
    maxHp: 360,
  },
  {
    id: 11, name: '감전 강타',   emoji: '🌩️', type: 'collision', cd: 2_000, color: '#ffee00',
    desc: '충돌 시 전기 피해 + 일시적 이동 제한',
    params: { damage: [26, 36], knockbackMult: 0.6, stunDuration: 1_300 },
    maxHp: 380,
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
    maxHp: 340,
  },
  {
    id: 14, name: '폭발 강타',   emoji: '💣',  type: 'collision', cd: 2_000, color: '#ffaa00',
    desc: '충돌 지점에서 폭발 — 근처 모두 피해',
    params: { damage: [22, 32], aoeRadius: 70, knockbackMult: 1.0 },
    maxHp: 430,
  },
  // ── 신규 능력 (IDs 16-25) ────────────────────────────────────
  { id:16, name:'벌집 지뢰',   emoji:'🐝', type:'auto', cd:15_000, color:'#ffaa00',
    desc:'설치 지점 범위 내 모든 적에게 3.5초간 지속 피해', maxHp:440,
    params:{ dotDamage:10, aoeRadius:65 } },
  { id:17, name:'환영의 역습', emoji:'🌀', type:'auto', cd:25_000, color:'#cc88ff',
    desc:'1.5초 무적+잔상 후 근처 적에게 연속 투사체 3발', maxHp:270,
    params:{ damage:[45,65], projectileCount:3, knockbackMult:0.8 } },
  { id:18, name:'해일 강타',   emoji:'🌊', type:'auto', cd:22_000, color:'#0088ff',
    desc:'필드 한쪽에서 반대쪽으로 물결이 쓸어가며 피해+넉백', maxHp:330,
    params:{ damage:[48,62], knockbackMult:1.5 } },
  { id:19, name:'곡사 투척',   emoji:'🪃', type:'auto', cd:13_000, color:'#88cc44',
    desc:'포물선 궤도로 가장 먼 적을 향해 투사체 투척+스플래시', maxHp:450,
    params:{ damage:[45,60], aoeRadius:40, knockbackMult:0.7 } },
  { id:20, name:'서리 투척',   emoji:'❄️', type:'auto', cd:11_000, color:'#88ddff',
    desc:'얼음 투사체 명중 시 데미지+이동속도 2초 감소', maxHp:450,
    params:{ damage:[32,42], knockbackMult:0.5, stunDuration:2_000 } },
  { id:21, name:'균열 강타',   emoji:'⚡', type:'collision', cd:2_000, color:'#aa8866',
    desc:'충돌 시 땅 갈라짐 이펙트+데미지', maxHp:390,
    params:{ damage:[35,50], knockbackMult:1.0 } },
  { id:22, name:'딸기 폭격',   emoji:'🍓', type:'auto', cd:40_000, color:'#ff4466',
    desc:'넓은 범위에 10발의 투사체가 쏟아짐 (중복 피격 가능)', maxHp:300,
    params:{ damage:[40,55], projectileCount:10, knockbackMult:0.6 } },
  { id:23, name:'그림자 결박', emoji:'🕸️', type:'auto', cd:16_000, color:'#442266',
    desc:'근처 적을 사슬로 묶어 1.5초 감속+도트 피해', maxHp:370,
    params:{ dotDamage:8, stunDuration:1_500 } },
  { id:24, name:'지뢰 매설',   emoji:'💥', type:'auto', cd:18_000, color:'#887700',
    desc:'현재 위치에 지뢰 설치, 1.5초 후 자동 폭발', maxHp:440,
    params:{ damage:[65,80], aoeRadius:70 } },
  { id:25, name:'관통 사격',   emoji:'🔫', type:'auto', cd:14_000, color:'#ffcc00',
    desc:'이동 방향으로 즉발 관통 사격 — 경로 내 모든 적 피해', maxHp:420,
    params:{ damage:[42,55], knockbackMult:0.4 } },
];

export function getAbility(id: number): AbilityDef {
  const ab = ABILITY_DEFS.find((a) => a.id === id);
  if (!ab) throw new Error(`Unknown ability id: ${id}`);
  return ab;
}

export const ALL_ABILITY_IDS = ABILITY_DEFS.map((a) => a.id);
