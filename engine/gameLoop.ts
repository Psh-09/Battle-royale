import type { GameState, GameCallbacks } from '@/types';
import { moveFighters, resolvePairCollisions } from './physics';
import { checkAutoAbility, fireCollisionAbility } from './abilities/index';
import { updateParticles, updateConfetti, updateFloatTexts, addFloatText } from './particles';
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

    // ── Phantom burst: fire projectiles when phantom phase ends ──
    for (const f of gs.fighters) {
      if (f.dead || !f.phantomReady) continue;
      f.phantomReady = false;
      const alive = gs.fighters.filter(ch => !ch.dead && ch !== f);
      if (!alive.length) continue;
      let nearest = alive[0]; let md = Infinity;
      for (const v of alive) { const d=Math.hypot(v.x-f.x,v.y-f.y); if(d<md){md=d;nearest=v;} }
      const sc2 = gs.fieldSize/500;
      const baseAng = Math.atan2(nearest.y-f.y, nearest.x-f.x);
      for (let pi=0; pi<3; pi++) {
        const spread=(pi-1)*0.18;
        gs.projectiles.push({
          x:f.x,y:f.y,
          vx:Math.cos(baseAng+spread)*300*sc2,
          vy:Math.sin(baseAng+spread)*300*sc2,
          r:8*sc2, dmg:45+Math.floor(Math.random()*20),
          color:'#cc88ff', caster:f, life:3_000,
          kind:'missile', launched:true, orbAng:0, orbitTime:0,
        });
      }
      addFloatText(gs, f.x, f.y-gs.baseR*sc2-8, '💜 환영의 역습!', '#cc88ff', 15);
    }

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
