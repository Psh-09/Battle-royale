import type { GameState, GameCallbacks } from '@/types';
import { addFloatText, spawnMiniParticles, spawnParticles } from './particles';
import { dealDmg, killFighter } from './combat';
import { sfx } from './audio';

export function updateEffects(gs: GameState, cbs: GameCallbacks, dt: number): void {
  const s = gs.fieldSize / 500;
  const r = gs.baseR * s;

  for (let i = gs.effects.length - 1; i >= 0; i--) {
    const e = gs.effects[i];
    e.life -= dt;

    // ── Mine: explode when life reaches 0 ──────────────────────
    if (e.type === 'mine' && !e.exploded) {
      if (e.life <= 0) {
        e.exploded = true;
        gs.effects.push({ type:'explosion', x:e.x, y:e.y, r:e.r, color:e.color, life:600, maxLife:600 });
        spawnParticles(gs, e.x, e.y, 30);
        sfx('boom');
        for (const f of gs.fighters) {
          if (f.dead || f === e.caster) continue;
          if (Math.hypot(f.x-e.x, f.y-e.y) < e.r + r) dealDmg(gs, cbs, e.caster, f, e.dmg, 1.0);
        }
      }
    }

    if (e.life <= 0) { gs.effects.splice(i, 1); continue; }

    // ── Poison cloud: apply poison to nearby fighters ───────────
    if (e.type === 'poisoncloud') {
      for (const f of gs.fighters) {
        if (f.dead || f === e.caster) continue;
        if (!e.hitCds[f.id]) e.hitCds[f.id] = 0;
        e.hitCds[f.id] -= dt;
        if (Math.hypot(f.x-e.x, f.y-e.y) < r+e.r && e.hitCds[f.id] <= 0) {
          f.poisonTimer = Math.max(f.poisonTimer, e.maxLife*0.75);
          f.poisonDmg = 8; f.poisonCaster = e.caster;
          e.hitCds[f.id] = 1_200;
          addFloatText(gs, f.x, f.y-r-4, '☠️ 중독!', '#55ee66', 11);
          spawnMiniParticles(gs, f.x, f.y, '#44cc55', 4);
        }
      }
    }

    // ── Hive: dot damage to nearby fighters ────────────────────
    if (e.type === 'hive') {
      for (const f of gs.fighters) {
        if (f.dead || f === e.caster) continue;
        if (!e.hitCds[f.id]) e.hitCds[f.id] = 0;
        e.hitCds[f.id] -= dt;
        if (Math.hypot(f.x-e.x, f.y-e.y) < r+e.r && e.hitCds[f.id] <= 0) {
          f.hp = Math.max(0, f.hp - 10);
          addFloatText(gs, f.x, f.y-r-4, '-10🐝', '#ffaa00', 9);
          spawnMiniParticles(gs, f.x, f.y, '#ffaa00', 3);
          e.hitCds[f.id] = 500;
          if (f.hp <= 0 && !f.dead) killFighter(gs, cbs, f, e.caster);
        }
      }
    }

    // ── Wave: move and hit fighters in path ────────────────────
    if (e.type === 'wave') {
      const ds = dt / 1000;
      e.x += e.vx * ds;
      const waveWidth = 28 * s; // wave front thickness
      for (const f of gs.fighters) {
        if (f.dead || f === e.caster || e.hitSet[f.id]) continue;
        if (Math.abs(f.x - e.x) < waveWidth + r) {
          e.hitSet[f.id] = true;
          dealDmg(gs, cbs, e.caster, f, e.dmg, 1.5);
          addFloatText(gs, f.x, f.y-r-4, '🌊', '#0088ff', 12);
        }
      }
    }
  }
}
