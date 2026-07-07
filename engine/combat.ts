import type { Fighter, GameState, GameCallbacks, EliminationEntry } from '@/types';
import { spawnParticles, addFloatText, spawnConfetti } from './particles';
import { sfx } from './audio';

const sc = (gs: GameState) => gs.fieldSize / 500;

export function dealDmg(gs: GameState, cbs: GameCallbacks, attacker: Fighter | null, defender: Fighter, dmg: number, kbMult: number): void {
  if (defender.dead) return;
  if (defender.invul > 0) return;
  rawDmg(gs, cbs, attacker, defender, dmg, kbMult);
}

export function rawDmg(gs: GameState, cbs: GameCallbacks, attacker: Fighter | null, defender: Fighter, dmg: number, kbMult: number): void {
  if (defender.dead) return;
  defender.hp = Math.max(0, defender.hp - dmg);
  defender.flash = 220;
  addFloatText(gs, defender.x, defender.y - gs.baseR*sc(gs) - 4, `-${dmg}`, '#ff5555', 11);
  if (kbMult > 0) {
    const s = sc(gs);
    const dx = defender.x - (attacker?.x ?? defender.x);
    const dy = defender.y - (attacker?.y ?? defender.y);
    const d = Math.hypot(dx, dy) || 1;
    const kbS = 560 * s * kbMult;
    defender.kbVx = (dx/d)*kbS; defender.kbVy = (dy/d)*kbS;
    defender.kbT = 340; defender.invul = 580;
  }
  const midX = attacker ? (attacker.x+defender.x)/2 : defender.x;
  const midY = attacker ? (attacker.y+defender.y)/2 : defender.y;
  spawnParticles(gs, midX, midY, 18);
  sfx('hit');
  if (defender.hp <= 0 && !defender.dead) killFighter(gs, cbs, defender, attacker);
}

export function killFighter(gs: GameState, cbs: GameCallbacks, fighter: Fighter, killer: Fighter | null): void {
  if (fighter.dead) return;
  fighter.dead = true; fighter.hp = 0;
  for (let i = gs.projectiles.length-1; i >= 0; i--)
    if (gs.projectiles[i].caster === fighter) gs.projectiles.splice(i,1);
  const alive = gs.fighters.filter(f => !f.dead);
  const rank = alive.length + 1;
  fighter.rank = rank; fighter.eliminatedAt = gs.elapsed;
  spawnParticles(gs, fighter.x, fighter.y, 35);
  addFloatText(gs, fighter.x, fighter.y - gs.baseR*sc(gs) - 6, '💀 KO!', '#ffffff', 15);
  const entry: EliminationEntry = { fighterId:fighter.id, name:fighter.name, color:fighter.color, rank, time:gs.elapsed };
  cbs.onElimination(entry);
  gs.fighters.forEach(f => { if (f.thrower === fighter) f.thrower = null; });
  const stillAlive = gs.fighters.filter(f => !f.dead);
  if (stillAlive.length <= 1) {
    const winner = stillAlive[0] ?? null;
    if (winner) { winner.rank = 1; spawnConfetti(gs, 170); sfx('win'); }
    gs.gameOver = true;
    setTimeout(() => cbs.onGameOver(winner), 600);
  }
}
