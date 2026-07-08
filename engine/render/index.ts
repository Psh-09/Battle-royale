import type { GameState } from '@/types';
import { drawFighter } from './drawFighter';
import { drawCraters,drawPoisonClouds,drawExplosions,drawTornadoEntities,drawLasers,drawUltimateBeams,drawChainLightning,drawElectricSparks,drawProjectileEntities,drawNewEffects } from './drawEffects';
import { drawParticles,drawConfetti,drawFloatTexts } from './drawParticles';

type Ctx2D = CanvasRenderingContext2D & { roundRect:(x:number,y:number,w:number,h:number,r:number)=>void };

function drawSlotMachines(ctx: CanvasRenderingContext2D, gs: GameState): void {
  if (!gs.slotMachines.length) return;
  const s  = gs.fieldSize / 500;
  const r  = gs.baseR * s; // 캐릭터 반지름 (실제 픽셀)
  const cx2 = ctx as Ctx2D;

  for (const sm of gs.slotMachines) {
    // 도박꾼 캐릭터 위치 추적 (2초 경직이지만 위치 변동 가능성 대비)
    const attacker = gs.fighters.find(f => f.id === sm.attackerId);
    if (!attacker) continue;

    // 크기: 캐릭터 지름의 약 2배
    const W  = r * 4.2;
    const H  = r * 2.8;
    const x0 = attacker.x - W / 2;
    const y0 = attacker.y - r - H - r * 0.3; // 캐릭터 머리 위에 위치

    const elapsed = 2_000 - sm.timer;

    // ── 정지 순서: 오른쪽(units) → 가운데(tens) → 왼쪽(hundreds) ──
    const stoppedRight  = elapsed > 600;
    const stoppedMid    = elapsed > 1_200;
    const stoppedLeft   = elapsed > 1_700;
    const stopped = [stoppedLeft, stoppedMid, stoppedRight]; // [left, mid, right]

    const sf = Math.floor(Date.now() / 80);
    const d  = [
      stoppedLeft  ? sm.digits[0] : sf % 10,
      stoppedMid   ? sm.digits[1] : (sf + 3) % 10,
      stoppedRight ? sm.digits[2] : (sf + 6) % 10,
    ];

    ctx.save();

    // ─ 몸체 ── beginPath() 필수: 경로 누적 방지 ────────────────────
    ctx.beginPath();
    ctx.fillStyle = '#1a0a00';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2 * s;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6 * s;
    cx2.roundRect(x0, y0, W, H, 5 * s);
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // ─ 상단 램프 3개 ──────────────────────────────────────────────
    const blink = Math.floor(Date.now() / 200) % 2 === 0;
    for (let li = 0; li < 3; li++) {
      ctx.beginPath(); // 각 램프마다 새 경로
      ctx.fillStyle = blink ? '#ff2200' : '#660000';
      ctx.shadowColor = '#ff0000'; ctx.shadowBlur = blink ? 7*s : 2*s;
      ctx.arc(x0 + W*(li+1)/4, y0 + H*0.1, 3*s, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ─ 숫자 칸 3개 ────────────────────────────────────────────────
    const cGap = W * 0.04;
    const cW   = (W - 4*cGap) / 3;
    const cH   = H * 0.58;
    const cY   = y0 + H * 0.2;
    const cX0  = x0 + cGap;

    for (let ci = 0; ci < 3; ci++) {
      const cx3 = cX0 + ci*(cW + cGap);

      // ↓ 핵심 수정: 칸마다 반드시 beginPath()로 새 경로 시작
      //   없으면 이전 칸들의 경로가 누적돼 마지막 fill()이 전체를 덮어씀
      ctx.beginPath();
      if (!stopped[ci]) {
        const pulse = 0.4 + 0.35*Math.sin(Date.now()/80);
        ctx.fillStyle = `rgba(255,220,0,${pulse*0.35})`;
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5*s;
      cx2.roundRect(cx3, cY, cW, cH, 3*s);
      ctx.fill(); ctx.stroke();

      // 숫자 텍스트 (fillText는 경로 불필요)
      ctx.font = `bold ${cH*0.68}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = stopped[ci] ? '#1a1a1a' : '#888888';
      ctx.fillText(String(d[ci]), cx3 + cW/2, cY + cH/2);
    }

    // ─ SPIN 문구 ──────────────────────────────────────────────────
    ctx.fillStyle = '#ff3300';
    ctx.font = `bold ${H*0.13}px 'Segoe UI', Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('SPIN', x0 + W/2, y0 + H - 2*s);

    // ─ 손잡이 레버 ────────────────────────────────────────────────
    const hx = x0 + W + 2*s;
    ctx.beginPath();
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2.5*s; ctx.lineCap = 'round';
    ctx.moveTo(hx, y0 + H*0.3);
    ctx.lineTo(hx + 9*s, y0 + H*0.3);
    ctx.lineTo(hx + 9*s, y0 + H*0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = '#cc0000';
    ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 5*s;
    ctx.arc(hx + 9*s, y0 + H*0.65, 4.5*s, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

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
