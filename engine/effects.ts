import type { GameState, GameCallbacks } from '@/types';
import { addFloatText, spawnMiniParticles } from './particles';

export function updateEffects(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = gs.fieldSize / 500;
  const r = gs.baseR * s;
  for (let i = gs.effects.length-1; i >= 0; i--) {
    const e = gs.effects[i];
    e.life -= dt;
    if (e.life <= 0) { gs.effects.splice(i,1); continue; }
    if (e.type === 'poisoncloud') {
      for (const f of gs.fighters) {
        if (f.dead || f === e.caster) continue;
        if (!e.hitCds[f.id]) e.hitCds[f.id] = 0;
        e.hitCds[f.id] -= dt;
        if (Math.hypot(f.x-e.x,f.y-e.y) < r+e.r && e.hitCds[f.id] <= 0) {
          f.poisonTimer = Math.max(f.poisonTimer, e.maxLife*0.75);
          f.poisonDmg = 8; f.poisonCaster = e.caster;
          e.hitCds[f.id] = 1_200;
          addFloatText(gs, f.x, f.y-r-4, '☠️ 중독!', '#55ee66', 11);
          spawnMiniParticles(gs, f.x, f.y, '#44cc55', 4);
        }
      }
    }
  }
}
