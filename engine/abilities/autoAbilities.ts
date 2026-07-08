import type { Fighter, GameState, GameCallbacks, LaserLine } from '@/types';
import { getAbility } from '@/data/abilityDefs';
import { dealDmg, rawDmg } from '../combat';
import { spawnParticles, spawnMiniParticles, addFloatText } from '../particles';
import { lineCirHit } from '../physics';
import { sfx } from '../audio';

const sc=(gs:GameState)=>gs.fieldSize/500;
const rnd=(n:number)=>Math.floor(Math.random()*n);

export function ab_laser(gs:GameState,cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,BEAMS=20; // 기존 12의 1.7배
  const lines:LaserLine[]=[]; const hitSet=new Set<Fighter>();
  for(let li=0;li<BEAMS;li++){
    const baseAng=(li/BEAMS)*Math.PI*2+(Math.random()-.5)*.18;
    const pts:Array<{x:number;y:number}>=[{x:c.x,y:c.y}];
    let x=c.x,y=c.y;
    for(let k=0;k<6;k++){
      const seg=gs.fieldSize*.27,jag=(Math.random()-.5)*46*s;
      x+=Math.cos(baseAng)*seg+Math.cos(baseAng+Math.PI/2)*jag;
      y+=Math.sin(baseAng)*seg+Math.sin(baseAng+Math.PI/2)*jag;
      pts.push({x,y});
    }
    lines.push(pts);
    for(const v of gs.fighters.filter(f=>!f.dead&&f!==c)){
      if(hitSet.has(v)||v.invul>0) continue;
      for(let k=0;k<pts.length-1;k++)
        if(lineCirHit(pts[k].x,pts[k].y,pts[k+1].x,pts[k+1].y,v.x,v.y,r*1.05)){hitSet.add(v);break;}
    }
  }
  const ab=getAbility(0);const[dMin,dMax]=ab.params.damage!;
  for(const v of hitSet) dealDmg(gs,cbs,c,v,dMin+rnd(dMax-dMin+1),ab.params.knockbackMult!);
  gs.effects.push({type:'laser',lines,color:c.color,life:820,maxLife:820});
  addFloatText(gs,c.x,c.y-r-6,'⚡ 번개 난사!',c.color,15); sfx('laser');
}

// id:1 화염폭발 제거됨

export function ab_missiles(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),ab=getAbility(2),alive=gs.fighters.filter(f=>!f.dead&&f!==c);
  const[dMin,dMax]=ab.params.damage!;
  for(let i=0;i<(ab.params.projectileCount??3);i++){
    const tgt=alive[Math.floor(Math.random()*alive.length)]; if(!tgt) continue;
    const a=Math.atan2(tgt.y-c.y,tgt.x-c.x)+(Math.random()-.5)*.25;
    gs.projectiles.push({x:c.x,y:c.y,vx:Math.cos(a)*240*s,vy:Math.sin(a)*240*s,r:7*s,dmg:dMin+rnd(dMax-dMin+1),color:'#ff4444',caster:c,life:5_500,kind:'missile',launched:true,orbAng:0,orbitTime:0});
  }
  addFloatText(gs,c.x,c.y-gs.baseR*s-6,'🚀 유도 미사일!','#ff4444',14); sfx('laser');
}

export function ab_poison(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),ab=getAbility(3);
  gs.effects.push({type:'poisoncloud',x:c.x,y:c.y,r:(ab.params.aoeRadius??72)*s,color:'#44cc55',caster:c,hitCds:{},life:4_200,maxLife:4_200});
  addFloatText(gs,c.x,c.y-gs.baseR*s-6,'☠️ 독 안개!','#44cc55',14);
}

export function ab_tornado(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),a=Math.random()*Math.PI*2,sp=175*s;
  // 회오리 버프: 지속 +2초(7.5s), 범위 1.5배(42*s), 데미지 1.7배(31)
  gs.tornadoes.push({x:c.x,y:c.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:42*s,life:7_500,dmg:31,caster:c,hitCds:{},rot:0});
  addFloatText(gs,c.x,c.y-gs.baseR*s-6,'🌪️ 회오리!','#88ccff',14);
}

export function ab_ultimate(gs:GameState,cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),alive=gs.fighters.filter(f=>!f.dead&&f!==c); if(!alive.length) return;
  let nearest=alive[0],md=Infinity;
  for(const v of alive){const d=Math.hypot(v.x-c.x,v.y-c.y);if(d<md){md=d;nearest=v;}}
  nearest.invul=0;
  const ab5=getAbility(5);
  rawDmg(gs,cbs,c,nearest,ab5.params.damage![0],ab5.params.knockbackMult!);
  gs.effects.push({type:'ultimate',x:c.x,y:c.y,tx:nearest.x,ty:nearest.y,color:c.color,life:900,maxLife:900});
  spawnParticles(gs,nearest.x,nearest.y,55);
  addFloatText(gs,c.x,c.y-gs.baseR*s-8,'💀 필살기!!!','#ffffff',18); sfx('ult');
}

export function ab_orbs(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),ab=getAbility(6),count=ab.params.projectileCount??6;
  const[dMin,dMax]=ab.params.damage!;
  for(let i=0;i<count;i++){
    const a=(i/count)*Math.PI*2;
    gs.projectiles.push({x:c.x+Math.cos(a)*gs.baseR*s*2.1,y:c.y+Math.sin(a)*gs.baseR*s*2.1,vx:0,vy:0,r:9*s,dmg:dMin+rnd(dMax-dMin+1),color:c.color,caster:c,life:6_800,kind:'orb',launched:false,orbAng:a,orbitTime:1_000});
  }
  addFloatText(gs,c.x,c.y-gs.baseR*s-6,'🔮 마법 구슬!',c.color,14); sfx('orb');
}

export function ab_sniper(gs:GameState,cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,alive=gs.fighters.filter(f=>!f.dead&&f!==c); if(!alive.length) return;
  let nearest=alive[0],md=Infinity;
  for(const v of alive){const d=Math.hypot(v.x-c.x,v.y-c.y);if(d<md){md=d;nearest=v;}}
  const a=Math.atan2(nearest.y-c.y,nearest.x-c.x),far=gs.fieldSize*1.5;
  const x1=c.x-Math.cos(a)*far,y1=c.y-Math.sin(a)*far,x2=c.x+Math.cos(a)*far,y2=c.y+Math.sin(a)*far;
  const ab=getAbility(7);const[dMin,dMax]=ab.params.damage!;
  for(const v of alive)
    if(lineCirHit(x1,y1,x2,y2,v.x,v.y,r*1.05)&&v.invul<=0)
      dealDmg(gs,cbs,c,v,dMin+rnd(dMax-dMin+1),ab.params.knockbackMult!);
  gs.effects.push({type:'sniper',lines:[[{x:x1,y:y1},{x:x2,y:y2}]],color:c.color,life:680,maxLife:680});
  addFloatText(gs,c.x,c.y-r-6,'🎯 저격!',c.color,14); sfx('laser');
}

export function ab_electricField(gs:GameState,cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(15),range=(ab.params.aoeRadius??120)*s;
  const[dMin,dMax]=ab.params.damage!;
  for(const v of gs.fighters.filter(f=>!f.dead&&f!==c)){
    const d=Math.hypot(v.x-c.x,v.y-c.y);
    if(d<range) dealDmg(gs,cbs,c,v,dMin+rnd(dMax-dMin+1),ab.params.knockbackMult!);
  }
  gs.effects.push({type:'explosion',x:c.x,y:c.y,r:range,color:'#ffee00',life:700,maxLife:700});
  for(let i=0;i<6;i++){const ang=(i/6)*Math.PI*2;gs.effects.push({type:'electric',x:c.x+Math.cos(ang)*range*.7,y:c.y+Math.sin(ang)*range*.7,life:500,maxLife:500});}
  addFloatText(gs,c.x,c.y-r-6,'🌐 전기장!','#ffee00',14); sfx('elec');
}

// ── 16: 벌집 지뢰 ────────────────────────────────────────────
export function ab_hive(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(16);
  // 버프: 지속 5초, 범위 1.5배 (aoeRadius 97)
  gs.effects.push({type:'hive',x:c.x,y:c.y,r:(ab.params.aoeRadius??97)*s,color:'#ffaa00',caster:c,hitCds:{},life:5_000,maxLife:5_000});
  addFloatText(gs,c.x,c.y-r-6,'🐝 벌집 지뢰!','#ffaa00',14);
}

// ── 17: 환영의 역습 ───────────────────────────────────────────
export function ab_phantom(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s;
  c.phantom=1_500; c.invul=9_999;
  // Two decoy phantoms
  for(let di=0;di<2;di++){
    const off=(di===0?-1:1)*(r*3);
    gs.effects.push({type:'phantom_decoy',x:c.x+off,y:c.y,life:1_500,maxLife:1_500,color:c.color,emoji:c.emoji,isReal:di===0});
  }
  addFloatText(gs,c.x,c.y-r-6,'🌀 환영의 역습!','#cc88ff',14);
  sfx('orb');
}

// ── 18: 해일 강타 ─────────────────────────────────────────────
export function ab_wave(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(18);
  const F=gs.fieldSize;
  const goRight=c.x<F/2;
  const startX=goRight?0:F;
  const spd=(F/1.2); // px/s → wave crosses field in ~1.2s
  const[dMin,dMax]=ab.params.damage!;
  gs.effects.push({type:'wave',x:startX,y:0,vx:goRight?spd:-spd,color:'#0088ff',caster:c,hitSet:{},life:1_400,maxLife:1_400,dmg:dMin+rnd(dMax-dMin+1)});
  addFloatText(gs,c.x,c.y-r-6,'🌊 해일 강타!','#0088ff',14);
  sfx('laser');
}

// ── 19: 곡사 투척 ─────────────────────────────────────────────
export function ab_arc(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(19);
  const alive=gs.fighters.filter(f=>!f.dead&&f!==c);
  if(!alive.length) return;
  // Target: farthest enemy
  let farthest=alive[0],maxD=0;
  for(const v of alive){const d=Math.hypot(v.x-c.x,v.y-c.y);if(d>maxD){maxD=d;farthest=v;}}
  const ang=Math.atan2(farthest.y-c.y,farthest.x-c.x);
  const spd=200*s;
  // Start with perpendicular offset velocity
  const perpAng=ang+Math.PI/2*(Math.random()>0.5?1:-1);
  const[dMin,dMax]=ab.params.damage!;
  gs.projectiles.push({
    x:c.x,y:c.y,
    vx:Math.cos(ang)*spd*0.5+Math.cos(perpAng)*spd*0.8,
    vy:Math.sin(ang)*spd*0.5+Math.sin(perpAng)*spd*0.8,
    r:10*s,dmg:dMin+rnd(dMax-dMin+1),color:'#88cc44',caster:c,life:4_000,
    kind:'arc',launched:true,orbAng:0,orbitTime:0,
    arcTarget:{x:farthest.x,y:farthest.y},splashRadius:ab.params.aoeRadius??40,
  });
  addFloatText(gs,c.x,c.y-r-6,'🪃 곡사 투척!','#88cc44',14);
  sfx('orb');
}

// ── 20: 서리 투척 ─────────────────────────────────────────────
export function ab_frost(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(20);
  const alive=gs.fighters.filter(f=>!f.dead&&f!==c);
  if(!alive.length) return;
  let nearest=alive[0],md=Infinity;
  for(const v of alive){const d=Math.hypot(v.x-c.x,v.y-c.y);if(d<md){md=d;nearest=v;}}
  const ang=Math.atan2(nearest.y-c.y,nearest.x-c.x);
  const[dMin,dMax]=ab.params.damage!;
  gs.projectiles.push({
    x:c.x,y:c.y,vx:Math.cos(ang)*220*s,vy:Math.sin(ang)*220*s,
    r:9*s,dmg:dMin+rnd(dMax-dMin+1),color:'#88ddff',caster:c,life:4_000,
    kind:'frost',launched:true,orbAng:0,orbitTime:0,
    frosting:ab.params.stunDuration??2_000,
  });
  addFloatText(gs,c.x,c.y-r-6,'❄️ 서리 투척!','#88ddff',14);
  sfx('orb');
}

// ── 22: 딸기 폭격 ─────────────────────────────────────────────
export function ab_barrage(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(22);
  const count=ab.params.projectileCount??10;
  const[dMin,dMax]=ab.params.damage!;
  const rangeX=gs.fieldSize*0.7;
  for(let i=0;i<count;i++){
    const bx=Math.max(r*2,Math.min(gs.fieldSize-r*2,c.x+(Math.random()-0.5)*rangeX));
    gs.projectiles.push({
      x:bx,y:-10,vx:0,vy:280*s,
      r:10*s,dmg:dMin+rnd(dMax-dMin+1),color:'#ff4466',caster:c,life:3_500,
      kind:'fall',launched:true,orbAng:0,orbitTime:0,fallFromTop:true,
    });
  }
  addFloatText(gs,c.x,c.y-r-6,'🍓 딸기 폭격!','#ff4466',14);
  sfx('boom');
}

// ── 23: 그림자 결박 ───────────────────────────────────────────
export function ab_shadowbind(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(23);
  const alive=gs.fighters.filter(f=>!f.dead&&f!==c);
  if(!alive.length) return;
  let nearest=alive[0],md=Infinity;
  for(const v of alive){const d=Math.hypot(v.x-c.x,v.y-c.y);if(d<md){md=d;nearest=v;}}
  const dur=ab.params.stunDuration??1_500;
  nearest.slowed=dur; nearest.slowMult=0.22;
  nearest.poisonTimer=Math.max(nearest.poisonTimer,dur);
  nearest.poisonDmg=ab.params.dotDamage??8; nearest.poisonCaster=c;
  gs.effects.push({type:'shadowbind',casterId:c.id,targetId:nearest.id,life:dur,maxLife:dur,color:'#442266'});
  addFloatText(gs,c.x,c.y-r-6,'🕸️ 그림자 결박!','#442266',14);
  addFloatText(gs,nearest.x,nearest.y-r-4,'결박!','#cc44ff',11);
  sfx('elec');
}

// ── 24: 지뢰 매설 (개편: 랜덤 3곳 투척, 근접 즉시/1.5초 자동 폭발) ──
export function ab_mine(gs:GameState,_cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,ab=getAbility(24);
  const[dMin,dMax]=ab.params.damage!;
  const mineR=(ab.params.aoeRadius??91)*s; // 70 × 1.3 = 91
  for(let i=0;i<3;i++){
    const ang=Math.random()*Math.PI*2;
    const dist=(70+Math.random()*160)*s;
    const mx=Math.max(mineR+5,Math.min(gs.fieldSize-mineR-5, c.x+Math.cos(ang)*dist));
    const my=Math.max(mineR+5,Math.min(gs.fieldSize-mineR-5, c.y+Math.sin(ang)*dist));
    gs.effects.push({type:'mine',x:mx,y:my,r:mineR,
      life:1_500,maxLife:1_500,color:'#887700',caster:c,
      dmg:dMin+rnd(dMax-dMin+1),exploded:false});
  }
  addFloatText(gs,c.x,c.y-r-6,'💥 지뢰 매설! ×3','#887700',13);
}

// id:25 관통사격 제거됨
