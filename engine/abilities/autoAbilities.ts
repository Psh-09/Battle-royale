import type { Fighter, GameState, GameCallbacks, LaserLine } from '@/types';
import { getAbility } from '@/data/abilityDefs';
import { dealDmg, rawDmg } from '../combat';
import { spawnParticles, spawnMiniParticles, addFloatText } from '../particles';
import { lineCirHit } from '../physics';
import { sfx } from '../audio';

const sc=(gs:GameState)=>gs.fieldSize/500;
const rnd=(n:number)=>Math.floor(Math.random()*n);

export function ab_laser(gs:GameState,cbs:GameCallbacks,c:Fighter):void {
  const s=sc(gs),r=gs.baseR*s,BEAMS=12;
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
  rawDmg(gs,cbs,c,nearest,150,2.8);
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
