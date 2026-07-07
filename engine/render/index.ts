import type { GameState } from '@/types';
import { drawFighter } from './drawFighter';
import { drawCraters,drawPoisonClouds,drawExplosions,drawTornadoEntities,drawLasers,drawUltimateBeams,drawChainLightning,drawElectricSparks,drawProjectileEntities } from './drawEffects';
import { drawParticles,drawConfetti,drawFloatTexts } from './drawParticles';

export function renderFrame(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const F=gs.fieldSize;
  ctx.clearRect(0,0,F,F);
  ctx.fillStyle='#0b0e16';ctx.fillRect(0,0,F,F);
  ctx.strokeStyle='#1a2030';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(F/2,0);ctx.lineTo(F/2,F);ctx.moveTo(0,F/2);ctx.lineTo(F,F/2);ctx.stroke();
  ctx.strokeStyle='#232d40';ctx.lineWidth=2.5;ctx.strokeRect(1,1,F-2,F-2);
  drawCraters(ctx,gs); drawPoisonClouds(ctx,gs); drawExplosions(ctx,gs); drawTornadoEntities(ctx,gs);
  drawParticles(ctx,gs);
  for(const f of gs.fighters) drawFighter(ctx,gs,f);
  drawProjectileEntities(ctx,gs);
  drawLasers(ctx,gs); drawUltimateBeams(ctx,gs); drawChainLightning(ctx,gs); drawElectricSparks(ctx,gs);
  drawFloatTexts(ctx,gs); drawConfetti(ctx,gs);

  // 서든데스 경기장 수축 오버레이
  if (gs.suddenDeath && gs.arenaMargin > 0) {
    drawSuddenDeath(ctx, gs);
  }
}

function drawSuddenDeath(ctx: CanvasRenderingContext2D, gs: GameState): void {
  const F = gs.fieldSize, m = gs.arenaMargin;
  const pulse = 0.25 + 0.15 * Math.sin(Date.now() / 180);

  // 위험지대 빨간 오버레이 (4변 스트립)
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ff2200';
  ctx.fillRect(0, 0, F, m);           // 상단
  ctx.fillRect(0, F-m, F, m);         // 하단
  ctx.fillRect(0, m, m, F-2*m);       // 좌측
  ctx.fillRect(F-m, m, m, F-2*m);     // 우측

  // 수축 경계선 (밝은 오렌지)
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 120);
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3 * (F / 500);
  ctx.strokeRect(m, m, F-2*m, F-2*m);
  ctx.restore();

  // "서든데스" 텍스트 (경기 시작 직후 5초간)
  if (gs.arenaMargin < 20) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - gs.arenaMargin / 20);
    ctx.font = `bold ${28*(F/500)}px 'Segoe UI', Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff4400';
    ctx.fillText('⚠️ 서든데스!', F/2, F/2);
    ctx.restore();
  }
}
