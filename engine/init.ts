import type { Fighter, GameState, RosterSlot } from '@/types';
import { ALL_ABILITY_IDS, ABILITY_DEFS, getGamblerHp } from '@/data/abilityDefs';
import { charRadius, BASE_SPEED, FALLBACK_EMOJIS } from '@/data/constants';

function shuffle<T>(arr: T[]): T[] {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

export function createFighter(slot: RosterSlot, index: number, total: number, abilityId: number, imageEl: HTMLImageElement | null, fieldSize: number): Fighter {
  const s = fieldSize/500;
  const ab = ABILITY_DEFS.find(a => a.id === abilityId);
  const speedMult = ab?.type === 'collision' ? 1.4 : 1.0;
  const spawnAng = (index/total)*Math.PI*2 - Math.PI/2;
  const moveAng = Math.random()*Math.PI*2;
  const baseSpd = (BASE_SPEED+(Math.random()-.5)*20)*s*speedMult;
  // 도박꾼(id:26): HP 250~450 랜덤 선형 분포 / 나머지: 능력별 고정 HP
  const baseHp = abilityId === 26 ? getGamblerHp() : (ab?.maxHp ?? 350);
  return {
    id:slot.id, name:slot.name, color:slot.color, imageEl,
    emoji:FALLBACK_EMOJIS[index%FALLBACK_EMOJIS.length],
    maxHp:baseHp, hp:baseHp, hpLag:baseHp, speed:baseSpd,
    x:fieldSize/2+Math.cos(spawnAng)*fieldSize*.28,
    y:fieldSize/2+Math.sin(spawnAng)*fieldSize*.28,
    vx:Math.cos(moveAng)*baseSpd, vy:Math.sin(moveAng)*baseSpd,
    dead:false, rank:null, eliminatedAt:null,
    abilityId,
    // 자동 발동형: 경기 시작부터 전체 쿨타임을 다 채워야 첫 발동 가능
    // 충돌 발동형: 충돌 즉시 쓸 수 있어야 하므로 0
    abilityCd: ab?.type === 'auto' ? (ab?.cd ?? 8_000) : 0,
    kbVx:0,kbVy:0,kbT:0, flash:0,invul:0,hitCd:0,stunned:0,
    isGrabbed:false,grabbedTimer:0,grabber:null,
    thrownCount:0,thrownDmg:0,landingDmg:0,hasLanded:false,thrower:null,
    poisonTimer:0,poisonDmg:0,poisonTickT:0,poisonCaster:null,
    awaken:false,awakenTriggered:false,
    slowed:0, slowMult:1.0, phantom:0, phantomReady:false, wallDmgT:0,
    totalDamageDealt:0, lastStandUsed:false, lastStandActive:false, lastStandTimer:0,
  };
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img); img.onerror=reject; img.src=url;
  });
}

export async function buildFighters(slots: RosterSlot[], fieldSize: number): Promise<Fighter[]> {
  const n=slots.length;

  // 직접 선택 모드: 모든 슬롯에 abilityId가 지정된 경우 그대로 사용
  // 랜덤 배분 모드: 기존과 동일하게 셔플 후 배분
  const allManual = slots.every(s => s.abilityId !== undefined);
  let assignedIds: number[];
  if (allManual) {
    assignedIds = slots.map(s => s.abilityId!);
  } else {
    const pool = shuffle([...ALL_ABILITY_IDS]);
    assignedIds = pool.slice(0, n);
  }

  return Promise.all(slots.map(async(slot,i)=>{
    let imageEl: HTMLImageElement|null=null;
    if(slot.imageUrl){try{imageEl=await loadImage(slot.imageUrl);}catch{}}
    return createFighter(slot,i,n,assignedIds[i],imageEl,fieldSize);
  }));
}

export function initGameState(fighters: Fighter[], fieldSize: number): GameState {
  return {
    fighters, particles:[], confetti:[], effects:[], projectiles:[], tornadoes:[], floatTexts:[],
    elapsed:0, gameOver:false, fieldSize, baseR:charRadius(fighters.length), lastTs:0,
    suddenDeath:false, arenaMargin:0,
  };
}
