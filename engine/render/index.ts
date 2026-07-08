import type { GameState } from '@/types';
import { drawFighter } from './drawFighter';
import { drawCraters,drawPoisonClouds,drawExplosions,drawTornadoEntities,drawLasers,drawUltimateBeams,drawChainLightning,drawElectricSparks,drawProjectileEntities,drawNewEffects } from './drawEffects';
import { drawParticles,drawConfetti,drawFloatTexts } from './drawParticles';

function drawSlotMachines(ctx: CanvasRenderingContext2D, gs: GameState): void {
  if (!gs.slotMachines.length) return;
  const s = gs.fieldSize / 500;

  for (const sm of gs.slotMachines) {
    const W = 210*s, H = 130*s;
    const x0 = sm.x - W/2, y0 = sm.y - H/2;
    const elapsed = 2_000 - sm.timer; // 0 → 2000

    // 각 릴 정지 시점 (왼쪽부터 순서대로)
    const reel1Stopped = elapsed > 600;
    const reel2Stopped = elapsed > 1_200;
    const reel3Stopped = elapsed > 1_700;

    // 스핀 중인 릴의 현재 표시 숫자
    const spinFrame = Math.floor(Date.now() / 80);
    const d = [
      reel1Stopped ? sm.digits[0] : spinFrame % 10,
      reel2Stopped ? sm.digits[1] : (spinFrame + 3) % 10,
      reel3Stopped ? sm.digits[2] : (spinFrame + 6) % 10,
    ];
    const stopped = [reel1Stopped, reel2Stopped, reel3Stopped];

    ctx.save();

    // ─ 몸체 ────────────────────────────────────────────────────
    ctx.fillStyle = '#1a0a00';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5 * s;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10 * s;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
      .roundRect(x0, y0, W, H, 10*s);
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // ─ 상단 램프 3개 ────────────────────────────────────────────
    const blink = Math.floor(Date.now() / 200) % 2 === 0;
    for (let li = 0; li < 3; li++) {
      ctx.fillStyle = blink ? '#ff2200' : '#880000';
      ctx.shadowColor = '#ff0000'; ctx.shadowBlur = blink ? 12*s : 4*s;
      ctx.beginPath();
      ctx.arc(x0 + W*(li+1)/4, y0 + 12*s, 6*s, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ─ SPIN 문구 ────────────────────────────────────────────────
    ctx.fillStyle = '#ff2200';
    ctx.font = `bold ${11*s}px 'Segoe UI', Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('SPIN', x0 + W*0.45, y0 + H - 5*s);

    // ─ 숫자 칸 3개 ─────────────────────────────────────────────
    const cellW = 50*s, cellH = 65*s, gap = 6*s;
    const totalW = 3*cellW + 2*gap;
    const cellX0 = x0 + (W - totalW) / 2;
    const cellY  = y0 + 22*s;

    for (let ci = 0; ci < 3; ci++) {
      const cx = cellX0 + ci*(cellW + gap);

      // 칸 배경
      if (!stopped[ci]) {
        const pulse = 0.5 + 0.4*Math.sin(Date.now()/80);
        ctx.fillStyle = `rgba(255,220,0,${pulse*0.3})`;
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2*s;
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
        .roundRect(cx, cellY, cellW, cellH, 4*s);
      ctx.fill(); ctx.stroke();

      // 숫자
      ctx.font = `bold ${38*s}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = stopped[ci] ? '#1a1a1a' : '#888';
      ctx.fillText(String(d[ci]), cx + cellW/2, cellY + cellH/2);
    }

    // ─ 손잡이 레버 ─────────────────────────────────────────────
    const hx = x0 + W + 8*s;
    ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = 4*s; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx, y0 + H*0.3);
    ctx.lineTo(hx + 18*s, y0 + H*0.3);
    ctx.lineTo(hx + 18*s, y0 + H*0.65);
    ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 8*s;
    ctx.beginPath();
    ctx.arc(hx + 18*s, y0 + H*0.65, 8*s, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ─ 금색 받침대 ─────────────────────────────────────────────
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
      .roundRect(x0 - 5*s, y0 + H, W + 10*s, 10*s, 4*s);
    ctx.fill();

    ctx.restore();
  }
}

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
  drawNewEffects(ctx,gs);
  drawFloatTexts(ctx,gs); drawConfetti(ctx,gs);
  drawSlotMachines(ctx,gs);

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
