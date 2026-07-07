import type { Fighter, GameState, GameCallbacks } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';
import { rawDmg, killFighter } from './combat';
import { spawnParticles, spawnMiniParticles, addFloatText } from './particles';
import { sfx } from './audio';

const sc = (gs: GameState) => gs.fieldSize / 500;

export function moveFighters(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = sc(gs), r = gs.baseR * s, ds = dt / 1000;

  for (const c of gs.fighters) {
    if (c.dead) continue;

    if (c.hitCd > 0)     c.hitCd     -= dt;
    if (c.flash > 0)     c.flash     -= dt;
    if (c.abilityCd > 0) c.abilityCd -= dt;
    if (c.slowed > 0) c.slowed -= dt;
    if (c.phantom > 0) {
      c.phantom -= dt; c.invul = 9_999; c.flash = 0;
      if (c.phantom <= 0) { c.phantom = 0; c.phantomReady = true; c.invul = 0; }
      // Skip rest of movement while in phantom
      continue;
    }

    if (c.isGrabbed) {
      c.invul = 9_999; c.flash = 60;
      c.grabbedTimer -= dt;
      if (c.grabbedTimer <= 0) {
        c.isGrabbed = false; c.invul = 0;
        const grabber = c.grabber; c.grabber = null;
        let dx = 0, dy = -1;
        if (grabber && !grabber.dead) { dx = c.x - grabber.x; dy = c.y - grabber.y; }
        else { const a = Math.random()*Math.PI*2; dx = Math.cos(a); dy = Math.sin(a); }
        const d = Math.hypot(dx,dy)||1;
        c.kbVx=(dx/d)*2_400*s; c.kbVy=(dy/d)*2_400*s; c.kbT=3_500;
        c.hasLanded=false;
        spawnParticles(gs,c.x,c.y,18); sfx('boom');
      }
      continue;
    }

    if (c.invul > 0)   c.invul   -= dt;
    if (c.stunned > 0) c.stunned -= dt;

    if (c.poisonTimer > 0) {
      c.poisonTimer -= dt; c.poisonTickT += dt;
      if (c.poisonTickT >= 500) {
        c.poisonTickT -= 500;
        c.hp = Math.max(0, c.hp - c.poisonDmg);
        if (c.hp <= 0 && !c.dead) killFighter(gs, cbs, c, c.poisonCaster);
      }
      if (c.poisonTimer <= 0) c.poisonTickT = 0;
    }

    const spdScale = c.stunned > 0 ? 0.22 : c.slowed > 0 ? c.slowMult : 1;
    if (c.kbT > 0) {
      c.kbT -= dt;
      c.x += c.kbVx*ds; c.y += c.kbVy*ds;
      c.kbVx *= Math.pow(0.008,ds); c.kbVy *= Math.pow(0.008,ds);
    } else {
      c.x += c.vx*ds*spdScale; c.y += c.vy*ds*spdScale;
    }

    let wallHit = false;
    const F = gs.fieldSize;
    // 서든데스 중에는 수축된 내부 경계를 벽으로 사용
    const m = gs.suddenDeath ? gs.arenaMargin : 0;
    if (c.x-r<m)     {c.x=m+r;     c.vx=Math.abs(c.vx);  c.kbVx=Math.abs(c.kbVx);  wallHit=true;}
    if (c.x+r>F-m)   {c.x=F-m-r;   c.vx=-Math.abs(c.vx); c.kbVx=-Math.abs(c.kbVx); wallHit=true;}
    if (c.y-r<m)     {c.y=m+r;     c.vy=Math.abs(c.vy);  c.kbVy=Math.abs(c.kbVy);  wallHit=true;}
    if (c.y+r>F-m)   {c.y=F-m-r;   c.vy=-Math.abs(c.vy); c.kbVy=-Math.abs(c.kbVy); wallHit=true;}

    // 서든데스 벽 데미지: 500ms마다 고정 5 데미지 틱
    if (gs.suddenDeath && m > 4) {
      const near = c.x < m + r + 2 || c.x > F - m - r - 2 || c.y < m + r + 2 || c.y > F - m - r - 2;
      if (near) {
        c.flash = Math.max(c.flash, 40);
        c.wallDmgT += dt;
        if (c.wallDmgT >= 500) {
          c.wallDmgT -= 500;
          c.hp = Math.max(0, c.hp - 5);
          addFloatText(gs, c.x, c.y - r - 4, '-5🔴', '#ff4400', 9);
          if (c.hp <= 0 && !c.dead) killFighter(gs, cbs, c, null);
        }
      } else {
        c.wallDmgT = 0;
      }
    }

    if (wallHit && c.kbT > 0 && c.thrownCount > 0) {
      const th = c.thrower;
      if (!c.hasLanded) {
        c.hasLanded = true;
        const craterLines: Array<[number,number,number,number,number,number]> = [];
        const n = 9 + Math.floor(Math.random()*4);
        for (let i = 0; i < n; i++) {
          const a=(i/n)*Math.PI*2+(Math.random()-.5)*.35;
          const len=(34+Math.random()*28)*s;
          const j1=(Math.random()-.5)*13*s, j2=(Math.random()-.5)*10*s;
          craterLines.push([c.x,c.y,
            c.x+Math.cos(a)*len*.45+Math.cos(a+Math.PI/2)*j1,
            c.y+Math.sin(a)*len*.45+Math.sin(a+Math.PI/2)*j1,
            c.x+Math.cos(a)*len+Math.cos(a+Math.PI/2)*j2,
            c.y+Math.sin(a)*len+Math.sin(a+Math.PI/2)*j2]);
        }
        gs.effects.push({type:'crater',cx:c.x,cy:c.y,lines:craterLines,life:2_500,maxLife:2_500});
        const ld=c.landingDmg; c.thrownCount--;
        if (c.thrownCount<=0){c.thrower=null;c.thrownDmg=0;c.landingDmg=0;}
        c.invul=0;
        rawDmg(gs,cbs,th,c,ld,0.2);
        addFloatText(gs,c.x,c.y-r-6,'💥 착지!','#ff8800',13);
        spawnParticles(gs,c.x,c.y,20);
      } else {
        c.thrownCount--;
        c.invul=0;
        const td=c.thrownDmg; const thr=c.thrower;
        if(c.thrownCount<=0){c.thrower=null;c.thrownDmg=0;c.landingDmg=0;}
        rawDmg(gs,cbs,thr,c,td,0.25);
        spawnMiniParticles(gs,c.x,c.y,'#ffaa33',14); sfx('hit');
      }
    }
  }
}

export function resolvePairCollisions(
  gs: GameState, cbs: GameCallbacks,
  fireCollision: (gs: GameState, cbs: GameCallbacks, att: Fighter, def: Fighter) => void
): void {
  const alive = gs.fighters.filter(f => !f.dead);
  const r = gs.baseR * sc(gs);
  for (let i = 0; i < alive.length; i++)
    for (let j = i+1; j < alive.length; j++)
      collidePair(gs, cbs, alive[i], alive[j], r, fireCollision);
}

function collidePair(
  gs: GameState, cbs: GameCallbacks, a: Fighter, b: Fighter, r: number,
  fireCollision: (gs: GameState, cbs: GameCallbacks, att: Fighter, def: Fighter) => void
): void {
  const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy)||.001;
  if (dist >= r*2) return;
  const ov=(r*2-dist)*.5, nx=dx/dist, ny=dy/dist;
  a.x-=nx*ov; a.y-=ny*ov; b.x+=nx*ov; b.y+=ny*ov;
  const dvx=a.vx-b.vx, dvy=a.vy-b.vy, dot=dvx*nx+dvy*ny;
  if (dot>0){a.vx-=dot*nx;a.vy-=dot*ny;b.vx+=dot*nx;b.vy+=dot*ny;}
  const abA=ABILITY_DEFS.find(ab=>ab.id===a.abilityId);
  const abB=ABILITY_DEFS.find(ab=>ab.id===b.abilityId);
  if (abA?.type==='collision'&&a.abilityCd<=0&&b.invul<=0&&!b.dead) fireCollision(gs,cbs,a,b);
  if (abB?.type==='collision'&&b.abilityCd<=0&&a.invul<=0&&!a.dead) fireCollision(gs,cbs,b,a);
}

export function lineCirHit(x1:number,y1:number,x2:number,y2:number,cx:number,cy:number,cr:number): boolean {
  const dx=x2-x1,dy=y2-y1,fx=x1-cx,fy=y1-cy;
  const a=dx*dx+dy*dy; if(!a) return false;
  const b=2*(fx*dx+fy*dy), c2=fx*fx+fy*fy-cr*cr;
  const disc=b*b-4*a*c2; if(disc<0) return false;
  const sq=Math.sqrt(disc),t1=(-b-sq)/(2*a),t2=(-b+sq)/(2*a);
  return (t1>=0&&t1<=1)||(t2>=0&&t2<=1)||(t1<0&&t2>1);
}
