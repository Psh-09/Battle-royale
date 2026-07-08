export type TriggerType = 'auto' | 'collision';

export interface AbilityParams {
  damage?: [number, number];
  aoeRadius?: number;
  knockbackMult?: number;
  dotDamage?: number;
  dotDuration?: number;
  chainCount?: number;
  wallBounces?: number;
  projectileCount?: number;
  stunDuration?: number;
  lifeStealRatio?: number;
}

export interface AbilityDef {
  id: number;
  name: string;
  emoji: string;
  type: TriggerType;
  cd: number;
  color: string;
  desc: string;
  params: AbilityParams;
  /** 능력 강도에 반비례하는 기본 최대 체력 */
  maxHp: number;
}

export interface RosterSlot {
  id: string;
  name: string;
  color: string;
  imageUrl: string | null;
  /** 직접 선택 모드에서 지정한 능력 ID. undefined = 랜덤 배정 */
  abilityId?: number;
}

export interface Fighter {
  id: string;
  name: string;
  color: string;
  imageEl: HTMLImageElement | null;
  emoji: string;
  maxHp: number;
  hp: number;
  hpLag: number;
  speed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dead: boolean;
  rank: number | null;
  eliminatedAt: number | null;
  abilityId: number;
  abilityCd: number;
  kbVx: number;
  kbVy: number;
  kbT: number;
  flash: number;
  invul: number;
  hitCd: number;
  stunned: number;
  isGrabbed: boolean;
  grabbedTimer: number;
  grabber: Fighter | null;
  thrownCount: number;
  thrownDmg: number;
  landingDmg: number;
  hasLanded: boolean;
  thrower: Fighter | null;
  poisonTimer: number;
  poisonDmg: number;
  poisonTickT: number;
  poisonCaster: Fighter | null;
  awaken: boolean;
  awakenTriggered: boolean;
  slowed: number;          // ms remaining for slow debuff
  slowMult: number;        // speed multiplier while slowed (0.0-1.0)
  phantom: number;         // ms remaining for phantom phase (환영의 역습)
  phantomReady: boolean;   // true when phantom phase just ended → fire burst
  wallDmgT: number;        // 서든데스 벽 데미지 틱 타이머 ms
  totalDamageDealt: number; // 경기 중 누적 딜량 (결과 화면 표시)
  lastStandUsed: boolean;   // 각성강타 최후 저항 1회용 사용 여부
  lastStandActive: boolean; // 최후 저항 발동 중 (5초 무적)
  lastStandTimer: number;   // 최후 저항 남은 시간 ms
}

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; sz: number; col: string;
  rot: number; rv: number; grav: number; circ: boolean;
}

export interface ConfettiPiece {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; w: number; h: number;
  col: string; rot: number; rv: number; grav: number;
}

export interface FloatText {
  x: number; y: number; text: string; color: string;
  sz: number; life: number; vy: number;
}

export type LaserLine = Array<{ x: number; y: number }>;

export interface LaserEffect   { type: 'laser' | 'sniper'; lines: LaserLine[]; color: string; life: number; maxLife: number; }
export interface ExplosionEffect { type: 'explosion'; x: number; y: number; r: number; color: string; life: number; maxLife: number; }
export interface CraterEffect  { type: 'crater'; cx: number; cy: number; lines: Array<[number,number,number,number,number,number]>; life: number; maxLife: number; }
export interface PoisonCloudEffect { type: 'poisoncloud'; x: number; y: number; r: number; color: string; caster: Fighter; hitCds: Record<string,number>; life: number; maxLife: number; }
export interface ChainEffect   { type: 'chain'; pts: Array<{x:number;y:number}>; color: string; life: number; maxLife: number; }
export interface ElectricEffect { type: 'electric'; x: number; y: number; life: number; maxLife: number; }
export interface UltimateEffect { type: 'ultimate'; x: number; y: number; tx: number; ty: number; color: string; life: number; maxLife: number; }

export interface HiveEffect {
  type: 'hive';
  x: number; y: number; r: number;
  color: string; caster: Fighter;
  hitCds: Record<string, number>;
  life: number; maxLife: number;
}
export interface WaveEffect {
  type: 'wave';
  x: number; y: number;        // current wave center x
  vx: number;                   // horizontal speed (positive=right, negative=left)
  color: string; caster: Fighter;
  hitSet: Record<string, boolean>;
  life: number; maxLife: number;
  dmg: number;
}
export interface ShadowBindEffect {
  type: 'shadowbind';
  casterId: string; targetId: string;
  life: number; maxLife: number;
  color: string;
}
export interface MineEffect {
  type: 'mine';
  x: number; y: number; r: number;
  life: number; maxLife: number;
  color: string; caster: Fighter; dmg: number;
  exploded: boolean;
}
export interface PhantomDecoyEffect {
  type: 'phantom_decoy';
  x: number; y: number;
  life: number; maxLife: number;
  color: string; emoji: string;
  isReal: boolean;
}

export type GameEffect = LaserEffect | ExplosionEffect | CraterEffect | PoisonCloudEffect | ChainEffect | ElectricEffect | UltimateEffect | HiveEffect | WaveEffect | ShadowBindEffect | MineEffect | PhantomDecoyEffect;

export type ProjectileKind = 'missile' | 'orb' | 'arc' | 'frost' | 'fall';

export interface Projectile {
  x: number; y: number; vx: number; vy: number; r: number;
  dmg: number; color: string; caster: Fighter; life: number;
  kind: ProjectileKind; launched: boolean; orbAng: number; orbitTime: number;
  gravity?: number;         // downward acceleration px/s² (arc/fall)
  splashRadius?: number;    // explosion radius on impact
  frosting?: number;        // slow duration ms on hit
  arcTarget?: { x: number; y: number }; // target pos for arc projectile
  hitIds?: Set<string>;     // already-hit fighter IDs (wave/arc)
  fallFromTop?: boolean;    // barrage: spawned at top, falls down
}

export interface Tornado {
  x: number; y: number; vx: number; vy: number; r: number;
  life: number; dmg: number; caster: Fighter; hitCds: Record<string,number>; rot: number;
}

export interface EliminationEntry {
  fighterId: string; name: string; color: string; rank: number; time: number;
}

/** 도박꾼 능력 슬롯머신 상태 */
export interface SlotMachine {
  x: number; y: number;
  attackerId: string;
  defenderId: string;
  timer: number;          // 카운트다운 ms (2000 → 0)
  digits: [number, number, number]; // 확정 숫자
  damage: number;         // 최종 데미지
}

export interface GameState {
  fighters: Fighter[];
  particles: Particle[];
  confetti: ConfettiPiece[];
  effects: GameEffect[];
  projectiles: Projectile[];
  tornadoes: Tornado[];
  floatTexts: FloatText[];
  slotMachines: SlotMachine[];
  elapsed: number;
  gameOver: boolean;
  fieldSize: number;
  baseR: number;
  lastTs: number;
  /** 서든데스 활성화 여부 (5인 이상 경기에서 조건 충족 시) */
  suddenDeath: boolean;
  /** 경기장 각 변에서 줄어든 픽셀 — 줄어든 내부 경계를 정의 */
  arenaMargin: number;
}

export interface GameCallbacks {
  onElimination: (entry: EliminationEntry) => void;
  onGameOver: (winner: Fighter | null) => void;
}

export type GameScreen = 'roster' | 'playing' | 'results';
