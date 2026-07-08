import type { Fighter, GameState, GameCallbacks } from '@/types';
import { getAbility, rollSlotDamage } from '@/data/abilityDefs';
import { rawDmg } from '../combat';
import { spawnParticles, spawnMiniParticles, addFloatText } from '../particles';
import { sfx } from '../audio';

const sc=(gs:GameState)=>gs.fieldSize/500;
const rnd=(n:number)=>Math.floor(Math.random()*n);
function dmgR(ab:ReturnType<typeof getAbility>):number{const[a,b]=ab.params.damage!;return a+rnd(b-a+1);}

function spawnCrater(gs:GameState,cx:number,cy:number):void{
  const s=sc(gs);
  const lines:Array<[number,number,number,number,number,number]>=[];
  const n=9+rnd(4);
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+(Math.random()-.5)*.35,len=(34+Math.random()*28)*s;
    const j1=(Math.random()-.5)*13*s,j2=(Math.random()-.5)*10*s;
    lines.push([cx,cy,cx+Math.cos(a)*len*.45+Math.cos(a+Math.PI/2)*j1,cy+Math.sin(a)*len*.45+Math.sin(a+Math.PI/2)*j1,cx+Math.cos(a)*len+Math.cos(a+Math.PI/2)*j2,cy+Math.sin(a)*len+Math.sin(a+Math.PI/2)*j2]);
  }
  gs.effects.push({type:'crater',cx,cy,lines,life:2_500,maxLife:2_500});
}

export function ab_throw(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs);
  att.abilityCd=2_000;
  rawDmg(gs,cbs,att,def,20,0); if(def.dead) return;
  def.isGrabbed=true;def.grabbedTimer=1_000;def.grabber=att;def.invul=9_999;
  def.kbVx=0;def.kbVy=0;def.kbT=0;
  def.thrownCount=3;def.thrownDmg=35;def.landingDmg=55;def.thrower=att;def.hasLanded=false;
  // 시전자도 1초 경직 (들어올리는 연출 중 둘 다 정지)
  att.kbT=1_000; att.kbVx=0; att.kbVy=0;
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'🤼 잡아 올려!',att.color,14); sfx('throw');
}

export function ab_awaken(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(9);
  // 각성 상태: 쿨타임 0.5초 고정 / 미각성: 일반 쿨타임
  // 각성 발동 체크는 rawDmg/dotDmg 내 checkAwakening()에서 처리됨
  att.abilityCd = att.awaken ? 500 : ab.cd;
  const[dMin,dMax]=ab.params.damage!;
  const dmg=att.awaken?(dMax+rnd(15)):(dMin+rnd(dMax-dMin+1));
  rawDmg(gs,cbs,att,def,dmg,ab.params.knockbackMult!);
  if(att.awaken) addFloatText(gs,att.x,att.y-gs.baseR*s-6,'🐲 각성 강타!','#ff6600',13);
}

export function ab_firecrash(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(10);
  att.abilityCd=ab.cd;
  rawDmg(gs,cbs,att,def,dmgR(ab),ab.params.knockbackMult!);
  spawnCrater(gs,def.x,def.y);
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'🔥 화염 강타!',att.color,13); sfx('boom');
}

export function ab_electric(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(11);
  att.abilityCd=ab.cd;
  rawDmg(gs,cbs,att,def,dmgR(ab),ab.params.knockbackMult!);
  def.stunned=ab.params.stunDuration??1_300;
  gs.effects.push({type:'electric',x:def.x,y:def.y,life:800,maxLife:800});
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'🌩️ 감전!','#eeee00',13); sfx('elec');
}

export function ab_vampiric(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(12);
  att.abilityCd=ab.cd;
  const dmg=dmgR(ab);
  rawDmg(gs,cbs,att,def,dmg,ab.params.knockbackMult!);
  const heal=Math.floor(dmg*(ab.params.lifeStealRatio??0.45));
  att.hp=Math.min(att.maxHp,att.hp+heal);
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,`+${heal}💚`,att.color,11);
}

export function ab_chainLightning(gs:GameState,cbs:GameCallbacks,att:Fighter,firstDef:Fighter):void{
  const s=sc(gs),ab=getAbility(13);
  att.abilityCd=ab.cd;
  const dmgLevels=[38,25,15]; // ×1.25 of [30,20,12]
  const pts:Array<{x:number;y:number}>=[{x:att.x,y:att.y}];
  const hit=new Set<Fighter>([att]);
  let cur:Fighter|null=firstDef;
  for(let lv=0;lv<(ab.params.chainCount??3)&&cur;lv++){
    rawDmg(gs,cbs,att,cur,dmgLevels[lv]??8,ab.params.knockbackMult!);
    pts.push({x:cur.x,y:cur.y}); hit.add(cur);
    let nxt:Fighter|null=null,md=Infinity;
    for(const f of gs.fighters.filter(f=>!f.dead&&!hit.has(f))){const d=Math.hypot(f.x-cur!.x,f.y-cur!.y);if(d<md){md=d;nxt=f;}}
    cur=nxt;
  }
  gs.effects.push({type:'chain',pts,color:'#00ddff',life:550,maxLife:550});
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'⛓️ 연쇄 번개!','#00ddff',13); sfx('elec');
}

export function ab_shockwave(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(14);
  att.abilityCd=ab.cd;
  rawDmg(gs,cbs,att,def,dmgR(ab),ab.params.knockbackMult!);
  const range=(ab.params.aoeRadius??70)*s;
  for(const f of gs.fighters.filter(f=>!f.dead&&f!==att&&f!==def)){
    const d=Math.hypot(f.x-def.x,f.y-def.y);
    if(d<range) rawDmg(gs,cbs,att,f,Math.floor(18*(1-d/range))+8,0.7);
  }
  gs.effects.push({type:'explosion',x:def.x,y:def.y,r:range,color:'#ffaa00',life:500,maxLife:500});
  spawnMiniParticles(gs,def.x,def.y,'#ffaa00',20);
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'💣 폭발 강타!',att.color,13); sfx('boom');
}

// ── 21: 균열 강타 ─────────────────────────────────────────────
export function ab_rift(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs),ab=getAbility(21);
  att.abilityCd=ab.cd;
  rawDmg(gs,cbs,att,def,dmgR(ab),ab.params.knockbackMult!);
  // Main crater
  spawnCrater(gs,def.x,def.y);
  // Extra smaller cracks at offset positions
  const offsets=[[15*s,-10*s],[-12*s,14*s],[8*s,16*s]];
  for(const[ox,oy] of offsets){
    const lines:Array<[number,number,number,number,number,number]>=[];
    for(let i=0;i<5;i++){
      const a=Math.random()*Math.PI*2,len=(15+Math.random()*15)*s;
      lines.push([def.x+ox,def.y+oy,def.x+ox+Math.cos(a)*len*0.4,def.y+oy+Math.sin(a)*len*0.4,def.x+ox+Math.cos(a)*len,def.y+oy+Math.sin(a)*len]);
    }
    gs.effects.push({type:'crater',cx:def.x+ox,cy:def.y+oy,lines,life:1_000,maxLife:1_000});
  }
  addFloatText(gs,att.x,att.y-gs.baseR*s-6,'⚡ 균열 강타!',att.color,13);
  sfx('boom');
}

// ── 26: 도박꾼 (슬롯머신 리메이크) ───────────────────────────
// 충돌 → 2초 경직+무적(시전자+상대) → 슬롯머신 연출 → 데미지 적용
export function ab_gambler(gs:GameState,cbs:GameCallbacks,att:Fighter,def:Fighter):void{
  const s=sc(gs);

  // 랜덤 쿨타임: 2~5초 uniform
  att.abilityCd = 2_000 + Math.random() * 3_000;

  // 시전자: 2초 경직 (zero-velocity KB)
  att.kbT = 2_000; att.kbVx = 0; att.kbVy = 0;

  // 상대: 2초 경직+무적
  def.kbT = 2_000; def.kbVx = 0; def.kbVy = 0;
  def.invul = 2_000;

  // 슬롯 결과 미리 결정 (3자리 숫자)
  const { digits, damage } = rollSlotDamage();

  // 슬롯머신 엔티티 등록 → gameLoop에서 타이머 감소 후 데미지 적용
  gs.slotMachines.push({
    x: gs.fieldSize / 2,
    y: gs.fieldSize / 2,
    attackerId: att.id,
    defenderId: def.id,
    timer: 2_000,
    digits,
    damage,
  });

  addFloatText(gs, att.x, att.y - gs.baseR*s - 6, '🎰 도박꾼!', '#ff9900', 14);
  sfx('orb');
}
