import type { GameState } from '@/types';

export function drawParticles(ctx: CanvasRenderingContext2D, gs: GameState): void {
  for (const p of gs.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
    if (p.circ) { ctx.beginPath(); ctx.arc(0,0,p.sz/2,0,Math.PI*2); ctx.fill(); }
    else ctx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz);
    ctx.restore();
  }
}

export function drawConfetti(ctx: CanvasRenderingContext2D, gs: GameState): void {
  for (const p of gs.confetti) {
    ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
    ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.col;
    ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
  }
}

export function drawFloatTexts(ctx: CanvasRenderingContext2D, gs: GameState): void {
  for (const ft of gs.floatTexts) {
    const alpha = ft.life > 400 ? 1 : ft.life / 400;
    ctx.save(); ctx.globalAlpha=Math.max(0,alpha);
    ctx.font=`bold ${ft.sz}px 'Segoe UI',Arial,sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.shadowColor='#000'; ctx.shadowBlur=5;
    ctx.fillStyle=ft.color; ctx.fillText(ft.text,ft.x,ft.y);
    ctx.restore();
  }
}
