import type { GameState, GameCallbacks } from '@/types';
import { moveFighters, resolvePairCollisions } from './physics';
import { checkAutoAbility, fireCollisionAbility } from './abilities/index';
import { updateParticles, updateConfetti, updateFloatTexts } from './particles';
import { updateEffects } from './effects';
import { updateProjectiles } from './projectiles';
import { updateTornadoes } from './tornadoes';
import { HP_LAG_RATE } from '@/data/constants';

const SUDDEN_DEATH_TIME_MS = 90_000;       // 1분 30초
const SUDDEN_DEATH_SURVIVOR_TRIGGER = 2;   // 생존자 2명
const SHRINK_RATE_PER_S = 4;               // px/s (FIELD=500 기준)
const MAX_MARGIN_RATIO = 0.38;             // fieldSize의 38%까지 줄어듦

export function stepGameState(gs: GameState, cbs: GameCallbacks, ts: number, speedMult: number): void {
  if (gs.lastTs === 0) { gs.lastTs = ts; return; }
  const raw = Math.min(ts - gs.lastTs, 50);
  gs.lastTs = ts;

  for (let step = 0; step < speedMult; step++) {
    if (gs.gameOver) break;
    const dt = raw;
    gs.elapsed += dt;

    // ── 서든데스 트리거 체크 (5인 이상 경기만) ──────────────────
    if (!gs.suddenDeath && gs.fighters.length >= 5) {
      const alive = gs.fighters.filter(f => !f.dead).length;
      if (gs.elapsed >= SUDDEN_DEATH_TIME_MS || alive <= SUDDEN_DEATH_SURVIVOR_TRIGGER) {
        gs.suddenDeath = true;
      }
    }

    // ── 서든데스 경기장 수축 ────────────────────────────────────
    if (gs.suddenDeath) {
      const s = gs.fieldSize / 500;
      const maxMargin = gs.fieldSize * MAX_MARGIN_RATIO;
      gs.arenaMargin = Math.min(maxMargin, gs.arenaMargin + SHRINK_RATE_PER_S * s * dt / 1_000);
    }

    for (const f of gs.fighters) if (!f.dead) checkAutoAbility(gs, cbs, f);
    moveFighters(gs, cbs, dt);
    resolvePairCollisions(gs, cbs, fireCollisionAbility);

    // ── 속도 정규화: 탄성 충돌 후 vx/vy 크기 복원 ────────────────
    for (const f of gs.fighters) {
      if (f.dead || f.isGrabbed || f.kbT > 0) continue;
      const spd = Math.hypot(f.vx, f.vy);
      if (spd > 0.001) {
        f.vx = (f.vx / spd) * f.speed;
        f.vy = (f.vy / spd) * f.speed;
      } else {
        // 완전히 멈춘 경우 랜덤 방향으로 재개
        const a = Math.random() * Math.PI * 2;
        f.vx = Math.cos(a) * f.speed;
        f.vy = Math.sin(a) * f.speed;
      }
    }

    updateProjectiles(gs, cbs, dt);
    updateTornadoes(gs, cbs, dt);
    updateEffects(gs, cbs, dt);
    updateParticles(gs, dt);
    updateConfetti(gs, dt);
    updateFloatTexts(gs, dt);
  }

  for (const f of gs.fighters) {
    if (f.hpLag > f.hp)
      f.hpLag = Math.max(f.hp, f.hpLag - Math.max(2, (f.hpLag - f.hp) * HP_LAG_RATE) * (raw / 16.67));
  }
}
