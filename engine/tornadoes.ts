import type { GameState, GameCallbacks } from '@/types';
import { dealDmg } from './combat';

export function updateTornadoes(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = gs.fieldSize / 500, ds = dt/1000, r = gs.baseR*s, F = gs.fieldSize;
  for (let i = gs.tornadoes.length-1; i >= 0; i--) {
    const t = gs.tornadoes[i];
    t.life-=dt; t.rot+=5*ds;
    if (t.life<=0) { gs.tornadoes.splice(i,1); continue; }
    t.x+=t.vx*ds; t.y+=t.vy*ds;
    if (t.x-t.r<0||t.x+t.r>F){t.vx*=-1;t.x=Math.max(t.r,Math.min(F-t.r,t.x));}
    if (t.y-t.r<0||t.y+t.r>F){t.vy*=-1;t.y=Math.max(t.r,Math.min(F-t.r,t.y));}
    for (const f of gs.fighters) {
      if (f.dead||f===t.caster) continue;
      if (!t.hitCds[f.id]) t.hitCds[f.id]=0;
      t.hitCds[f.id]-=dt;
      if (Math.hypot(t.x-f.x,t.y-f.y)<r+t.r && t.hitCds[f.id]<=0) {
        dealDmg(gs,cbs,t.caster,f,t.dmg,0.5);
        t.hitCds[f.id]=850;
      }
    }
  }
}
