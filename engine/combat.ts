import type { Fighter, GameState, GameCallbacks, EliminationEntry } from '@/types';
import { spawnParticles, addFloatText, spawnConfetti } from './particles';
import { sfx } from './audio';

const sc = (gs: GameState) => gs.fieldSize / 500;

// ─── 기본 피해 (invul 체크 포함) ─────────────────────────────
export function dealDmg(gs: GameState, cbs: GameCallbacks, attacker: Fighter | null, defender: Fighter, dmg: number, kbMult: number): void {
  if (defender.dead) return;
  if (defender.invul > 0) return;
  rawDmg(gs, cbs, attacker, defender, dmg, kbMult);
}

// ─── 직접 피해 (invul 무시) — 넉백·파티클·sfx 포함 ──────────
export function rawDmg(gs: GameState, cbs: GameCallbacks, attacker: Fighter | null, defender: Fighter, dmg: number, kbMult: number): void {
  if (defender.dead) return;

  // 최후의 저항 중 — 모든 피해 차단
  if (defender.lastStandActive) { defender.hp = 1; return; }

  // 실제 HP 감소량 계산 & 딜량 추적
  const actualDmg = Math.min(dmg, Math.max(0, defender.hp));
  defender.hp = Math.max(0, defender.hp - dmg);
  if (attacker) attacker.totalDamageDealt += actualDmg;

  defender.flash = 220;
  addFloatText(gs, defender.x, defender.y - gs.baseR * sc(gs) - 4, `-${dmg}`, '#ff5555', 11);

  if (kbMult > 0) {
    const s = sc(gs);
    const dx = defender.x - (attacker?.x ?? defender.x);
    const dy = defender.y - (attacker?.y ?? defender.y);
    const d = Math.hypot(dx, dy) || 1;
    const kbS = 560 * s * kbMult;
    defender.kbVx = (dx / d) * kbS; defender.kbVy = (dy / d) * kbS;
    defender.kbT = 340; defender.invul = 580;
  }

  spawnParticles(gs, attacker ? (attacker.x + defender.x) / 2 : defender.x, attacker ? (attacker.y + defender.y) / 2 : defender.y, 18);
  sfx('hit');

  // 각성강타 최후의 저항 발동 체크 (abilityId 9, HP ≤ 1, 1회만)
  if (
    defender.abilityId === 9 &&
    defender.hp <= 1 &&
    !defender.lastStandUsed &&
    !defender.lastStandActive
  ) {
    defender.lastStandUsed   = true;
    defender.lastStandActive = true;
    defender.lastStandTimer  = 5_000;
    defender.hp = 1;
    addFloatText(gs, defender.x, defender.y - gs.baseR * sc(gs) - 10, '🐲 최후의 저항!', '#ffdd00', 16);
    spawnParticles(gs, defender.x, defender.y, 40);
    return; // 이번 프레임 사망 처리 건너뜀
  }

  if (defender.hp <= 0 && !defender.dead) killFighter(gs, cbs, defender, attacker);
}

// ─── DOT 전용 피해 (파티클·sfx 없음, 딜량 추적·최후 저항 포함) ─
export function dotDmg(gs: GameState, cbs: GameCallbacks, attacker: Fighter | null, defender: Fighter, dmg: number): void {
  if (defender.dead) return;
  if (defender.lastStandActive) { defender.hp = 1; return; }

  const actualDmg = Math.min(dmg, Math.max(0, defender.hp));
  defender.hp = Math.max(0, defender.hp - dmg);
  if (attacker) attacker.totalDamageDealt += actualDmg;

  // 각성강타 최후의 저항
  if (defender.abilityId === 9 && defender.hp <= 1 && !defender.lastStandUsed && !defender.lastStandActive) {
    defender.lastStandUsed   = true;
    defender.lastStandActive = true;
    defender.lastStandTimer  = 5_000;
    defender.hp = 1;
    addFloatText(gs, defender.x, defender.y - gs.baseR * sc(gs) - 10, '🐲 최후의 저항!', '#ffdd00', 16);
    spawnParticles(gs, defender.x, defender.y, 40);
    return;
  }

  if (defender.hp <= 0 && !defender.dead) killFighter(gs, cbs, defender, attacker);
}

// ─── 사망 처리 ────────────────────────────────────────────────
export function killFighter(gs: GameState, cbs: GameCallbacks, fighter: Fighter, killer: Fighter | null): void {
  if (fighter.dead) return;
  fighter.dead = true; fighter.hp = 0;
  for (let i = gs.projectiles.length - 1; i >= 0; i--)
    if (gs.projectiles[i].caster === fighter) gs.projectiles.splice(i, 1);
  const alive = gs.fighters.filter(f => !f.dead);
  const rank = alive.length + 1;
  fighter.rank = rank; fighter.eliminatedAt = gs.elapsed;
  spawnParticles(gs, fighter.x, fighter.y, 35);
  addFloatText(gs, fighter.x, fighter.y - gs.baseR * sc(gs) - 6, '💀 KO!', '#ffffff', 15);
  const entry: EliminationEntry = { fighterId: fighter.id, name: fighter.name, color: fighter.color, rank, time: gs.elapsed };
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
