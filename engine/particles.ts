import type { GameState } from '@/types';
import { PARTICLE_COLORS } from '@/data/constants';

const rnd = (n: number) => Math.floor(Math.random() * n);

export function spawnParticles(gs: GameState, x: number, y: number, n: number): void {
  const s = gs.fieldSize / 500;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (Math.random() * 250 + 70) * s;
    gs.particles.push({
      x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 45*s,
      life:1, decay:0.022+Math.random()*0.022,
      sz:(Math.random()*6+2)*s, col:PARTICLE_COLORS[rnd(PARTICLE_COLORS.length)],
      rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*8, grav:350*s, circ:Math.random()>.5,
    });
  }
}

export function spawnMiniParticles(gs: GameState, x: number, y: number, col: string, n: number): void {
  const s = gs.fieldSize / 500;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (Math.random() * 120 + 40) * s;
    gs.particles.push({
      x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-20*s,
      life:1, decay:0.04, sz:(Math.random()*4+1.5)*s, col,
      rot:0, rv:0, grav:200*s, circ:true,
    });
  }
}

export function spawnConfetti(gs: GameState, n: number): void {
  const s = gs.fieldSize / 500;
  for (let i = 0; i < n; i++) {
    gs.confetti.push({
      x:Math.random()*gs.fieldSize, y:-10-Math.random()*40,
      vx:(Math.random()-.5)*72*s, vy:(Math.random()*68+24)*s,
      life:1, decay:0.0016, w:(Math.random()*11+5)*s, h:(Math.random()*5+3)*s,
      col:PARTICLE_COLORS[rnd(PARTICLE_COLORS.length)],
      rot:Math.random()*Math.PI*2, rv:(Math.random()-.5)*4, grav:15*s,
    });
  }
}

export function addFloatText(gs: GameState, x: number, y: number, text: string, color: string, size = 12): void {
  const s = gs.fieldSize / 500;
  gs.floatTexts.push({ x, y, text, color, sz:size*s, life:1_500, vy:-50*s });
}

export function updateParticles(gs: GameState, dt: number): void {
  const ds = dt / 1000;
  for (let i = gs.particles.length-1; i >= 0; i--) {
    const p = gs.particles[i];
    p.x+=p.vx*ds; p.y+=p.vy*ds; p.vy+=p.grav*ds;
    p.vx*=Math.pow(0.3,ds); p.life-=p.decay*dt; p.rot+=p.rv*ds;
    if (p.life<=0) gs.particles.splice(i,1);
  }
}

export function updateConfetti(gs: GameState, dt: number): void {
  const ds = dt / 1000;
  for (let i = gs.confetti.length-1; i >= 0; i--) {
    const p = gs.confetti[i];
    p.x+=p.vx*ds; p.y+=p.vy*ds; p.vy+=p.grav*ds;
    p.vx+=(Math.random()-.5)*1.5*(gs.fieldSize/500);
    p.life-=p.decay*dt; p.rot+=p.rv*ds;
    if (p.life<=0||p.y>gs.fieldSize+30) gs.confetti.splice(i,1);
  }
}

export function updateFloatTexts(gs: GameState, dt: number): void {
  const ds = dt / 1000;
  for (let i = gs.floatTexts.length-1; i >= 0; i--) {
    const ft = gs.floatTexts[i];
    ft.life-=dt; ft.y+=ft.vy*ds;
    if (ft.life<=0) gs.floatTexts.splice(i,1);
  }
}
