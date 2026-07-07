import type { GameState, GameCallbacks } from '@/types';
import { dealDmg } from './combat';
import { spawnMiniParticles, spawnParticles, addFloatText } from './particles';
import { sfx } from './audio';

export function updateProjectiles(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = gs.fieldSize / 500, ds = dt/1000, r = gs.baseR*s;
  for (let i = gs.projectiles.length-1; i >= 0; i--) {
    const p = gs.projectiles[i];
    p.life -= dt;
    if (p.life<=0||p.caster.dead) { gs.projectiles.splice(i,1); continue; }

    // ── Orb: orbit phase ────────────────────────────────────────
    if (p.kind==='orb'&&!p.launched) {
      p.orbitTime-=dt; p.orbAng+=3.5*ds;
      p.x=p.caster.x+Math.cos(p.orbAng)*r*2.1;
      p.y=p.caster.y+Math.sin(p.orbAng)*r*2.1;
      if (p.orbitTime<=0) {
        p.launched=true;
        const tgts=gs.fighters.filter(f=>!f.dead&&f!==p.caster);
        if (!tgts.length) { gs.projectiles.splice(i,1); continue; }
        const tgt=tgts[Math.floor(Math.random()*tgts.length)];
        const a=Math.atan2(tgt.y-p.y,tgt.x-p.x);
        p.vx=Math.cos(a)*200*s; p.vy=Math.sin(a)*200*s;
      }
      continue;
    }

    // ── Fall: vertical from top, skip wall bounce ───────────────
    if (p.kind==='fall'||p.fallFromTop) {
      p.y+=p.vy*ds;
      // hit check
      let hit=false;
      for (const f of gs.fighters) {
        if(f.dead||f===p.caster||f.invul>0) continue;
        if(Math.hypot(p.x-f.x,p.y-f.y)<r+p.r) {
          dealDmg(gs,cbs,p.caster,f,p.dmg,0.6);
          spawnMiniParticles(gs,p.x,p.y,p.color,8);
          gs.projectiles.splice(i,1); hit=true; break;
        }
      }
      if(!hit&&p.y>gs.fieldSize+p.r) gs.projectiles.splice(i,1);
      continue;
    }

    // ── Arc: homing with arc curve toward target ─────────────────
    if (p.kind==='arc') {
      if (p.arcTarget) {
        const tx=p.arcTarget.x-p.x, ty=p.arcTarget.y-p.y;
        const dist=Math.hypot(tx,ty);
        if (dist < r*2) {
          // Splash explosion
          const splashR=(p.splashRadius??40)*s;
          gs.effects.push({type:'explosion',x:p.x,y:p.y,r:splashR,color:p.color,life:500,maxLife:500});
          spawnParticles(gs,p.x,p.y,20);
          for (const f of gs.fighters) {
            if(f.dead||f===p.caster) continue;
            const d=Math.hypot(f.x-p.x,f.y-p.y);
            if(d<splashR+r) dealDmg(gs,cbs,p.caster,f,Math.floor(p.dmg*(1-d/splashR*0.5)),0.7);
          }
          gs.projectiles.splice(i,1); continue;
        }
        // Steer toward target
        const a=Math.atan2(ty,tx);
        const steer=0.06*(dt/16.67)*260*s;
        p.vx+=Math.cos(a)*steer; p.vy+=Math.sin(a)*steer;
        const sp=Math.hypot(p.vx,p.vy),max=240*s;
        if(sp>max){p.vx=p.vx/sp*max;p.vy=p.vy/sp*max;}
      }
    }

    // ── Missile: homing toward nearest ─────────────────────────
    if (p.kind==='missile') {
      const tgts=gs.fighters.filter(f=>!f.dead&&f!==p.caster);
      if (tgts.length) {
        let near=tgts[0],md=Math.hypot(tgts[0].x-p.x,tgts[0].y-p.y);
        for (const t of tgts){const d=Math.hypot(t.x-p.x,t.y-p.y);if(d<md){md=d;near=t;}}
        const a=Math.atan2(near.y-p.y,near.x-p.x);
        const home=0.08*(dt/16.67)*240*s;
        p.vx+=Math.cos(a)*home; p.vy+=Math.sin(a)*home;
        const sp=Math.hypot(p.vx,p.vy),max=260*s;
        if(sp>max){p.vx=p.vx/sp*max;p.vy=p.vy/sp*max;}
      }
    }

    // ── Move ─────────────────────────────────────────────────────
    p.x+=p.vx*ds; p.y+=p.vy*ds;

    // ── Wall bounce (not for fall) ────────────────────────────────
    const F=gs.fieldSize, m=gs.suddenDeath?gs.arenaMargin:0;
    if(p.x<p.r+m||p.x>F-p.r-m){p.vx*=-1;p.x=Math.max(p.r+m,Math.min(F-p.r-m,p.x));}
    if(p.y<p.r+m||p.y>F-p.r-m){p.vy*=-1;p.y=Math.max(p.r+m,Math.min(F-p.r-m,p.y));}

    // ── Hit check ────────────────────────────────────────────────
    let hit=false;
    for (const f of gs.fighters) {
      if(f.dead||f===p.caster||f.invul>0) continue;
      if(Math.hypot(p.x-f.x,p.y-f.y)<r+p.r) {
        dealDmg(gs,cbs,p.caster,f,p.dmg,0.4);
        // Frost slow
        if (p.kind==='frost'&&p.frosting&&p.frosting>0) {
          f.slowed=p.frosting; f.slowMult=0.35;
          addFloatText(gs,f.x,f.y-r-4,'❄️ 빙결!','#88ddff',11);
        }
        spawnMiniParticles(gs,p.x,p.y,p.color,10);
        gs.projectiles.splice(i,1); hit=true; break;
      }
    }
    if(hit) continue;
  }
}
