import type { GameState, GameCallbacks } from '@/types';
import { dealDmg } from './combat';
import { spawnMiniParticles } from './particles';

export function updateProjectiles(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = gs.fieldSize/500, ds = dt/1000, r = gs.baseR*s;
  for (let i = gs.projectiles.length-1; i >= 0; i--) {
    const p = gs.projectiles[i];
    p.life-=dt;
    if (p.life<=0||p.caster.dead) { gs.projectiles.splice(i,1); continue; }
    if (p.kind==='orb'&&!p.launched) {
      p.orbitTime-=dt; p.orbAng+=3.5*ds;
      p.x=p.caster.x+Math.cos(p.orbAng)*r*2.1;
      p.y=p.caster.y+Math.sin(p.orbAng)*r*2.1;
      if (p.orbitTime<=0) {
        p.launched=true;
        const targets=gs.fighters.filter(f=>!f.dead&&f!==p.caster);
        if (!targets.length) { gs.projectiles.splice(i,1); continue; }
        const tgt=targets[Math.floor(Math.random()*targets.length)];
        const a=Math.atan2(tgt.y-p.y,tgt.x-p.x);
        p.vx=Math.cos(a)*200*s; p.vy=Math.sin(a)*200*s;
      }
      continue;
    }
    if (p.kind==='missile') {
      const targets=gs.fighters.filter(f=>!f.dead&&f!==p.caster);
      if (targets.length) {
        let near=targets[0],md=Math.hypot(targets[0].x-p.x,targets[0].y-p.y);
        for (const t of targets){const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<md){md=d;near=t;}}
        const a=Math.atan2(near.y-p.y,near.x-p.x);
        const home=0.08*(dt/16.67)*240*s;
        p.vx+=Math.cos(a)*home; p.vy+=Math.sin(a)*home;
        const sp=Math.hypot(p.vx,p.vy),max=260*s;
        if(sp>max){p.vx=p.vx/sp*max;p.vy=p.vy/sp*max;}
      }
    }
    p.x+=p.vx*ds; p.y+=p.vy*ds;
    const F=gs.fieldSize;
    if(p.x<p.r||p.x>F-p.r){p.vx*=-1;p.x=Math.max(p.r,Math.min(F-p.r,p.x));}
    if(p.y<p.r||p.y>F-p.r){p.vy*=-1;p.y=Math.max(p.r,Math.min(F-p.r,p.y));}
    let hit=false;
    for (const f of gs.fighters) {
      if(f.dead||f===p.caster||f.invul>0) continue;
      if(Math.hypot(p.x-f.x,p.y-f.y)<r+p.r){
        dealDmg(gs,cbs,p.caster,f,p.dmg,0.4);
        spawnMiniParticles(gs,p.x,p.y,p.color,10);
        gs.projectiles.splice(i,1); hit=true; break;
      }
    }
    if(hit) continue;
  }
}
