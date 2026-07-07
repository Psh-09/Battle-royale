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

export type GameEffect = LaserEffect | ExplosionEffect | CraterEffect | PoisonCloudEffect | ChainEffect | ElectricEffect | UltimateEffect;

export type ProjectileKind = 'missile' | 'orb';

export interface Projectile {
  x: number; y: number; vx: number; vy: number; r: number;
  dmg: number; color: string; caster: Fighter; life: number;
  kind: ProjectileKind; launched: boolean; orbAng: number; orbitTime: number;
}

export interface Tornado {
  x: number; y: number; vx: number; vy: number; r: number;
  life: number; dmg: number; caster: Fighter; hitCds: Record<string,number>; rot: number;
}

export interface EliminationEntry {
  fighterId: string; name: string; color: string; rank: number; time: number;
}

export interface GameState {
  fighters: Fighter[];
  particles: Particle[];
  confetti: ConfettiPiece[];
  effects: GameEffect[];
  projectiles: Projectile[];
  tornadoes: Tornado[];
  floatTexts: FloatText[];
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
