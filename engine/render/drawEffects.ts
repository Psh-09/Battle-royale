import type { GameState } from '@/types';

const sc=(gs:GameState)=>gs.fieldSize/500;

export function drawCraters(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const e of gs.effects){
    if(e.type!=='crater') continue;
    ctx.save(); ctx.globalAlpha=Math.max(0,e.life/e.maxLife)*.75;
    ctx.strokeStyle='#6a7080'; ctx.lineWidth=1.5*s; ctx.lineCap='round';
    for(const[x1,y1,mx,my,ex,ey] of e.lines){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(mx,my);ctx.lineTo(ex,ey);ctx.stroke();}
    ctx.fillStyle='#4a5060'; ctx.beginPath(); ctx.arc(e.cx,e.cy,6*s,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

export function drawPoisonClouds(ctx:CanvasRenderingContext2D,gs:GameState):void{
  for(const e of gs.effects){
    if(e.type!=='poisoncloud') continue;
    ctx.save(); ctx.globalAlpha=Math.max(0,e.life/e.maxLife)*.35;
    const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r);
    g.addColorStop(0,'rgba(40,200,70,.9)'); g.addColorStop(1,'rgba(40,200,70,0)');
    ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.restore();
  }
}

export function drawExplosions(ctx:CanvasRenderingContext2D,gs:GameState):void{
  for(const e of gs.effects){
    if(e.type!=='explosion') continue;
    const pct=e.life/e.maxLife;
    ctx.save(); ctx.globalAlpha=pct*.7;
    const expandedR=e.r*(1.4-pct*.4);
    const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,expandedR);
    g.addColorStop(0,e.color+'ff'); g.addColorStop(0.5,e.color+'88'); g.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(e.x,e.y,expandedR,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.restore();
  }
}

export function drawTornadoEntities(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const t of gs.tornadoes){
    ctx.save(); ctx.translate(t.x,t.y); ctx.rotate(t.rot);
    ctx.globalAlpha=Math.min(1,t.life/500)*.8;
    for(let i=0;i<3;i++){
      ctx.beginPath(); ctx.arc(0,0,t.r*(.5+i*.22),i*(Math.PI*2/3),i*(Math.PI*2/3)+Math.PI*1.6);
      ctx.strokeStyle=`rgba(140,200,255,${.85-i*.2})`; ctx.lineWidth=(4-i)*s; ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawLasers(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const e of gs.effects){
    if(e.type!=='laser'&&e.type!=='sniper') continue;
    const alpha=Math.max(0,e.life/e.maxLife);
    ctx.save(); ctx.globalAlpha=alpha; ctx.lineCap='round'; ctx.lineJoin='round';
    for(const pts of e.lines){
      if(pts.length<2) continue;
      ctx.lineWidth=10*s; ctx.strokeStyle=e.color+'44'; ctx.shadowColor=e.color; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      for(let j=1;j<pts.length;j++) ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
      ctx.lineWidth=2.5*s; ctx.strokeStyle='#fff'; ctx.shadowBlur=5;
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      for(let j=1;j<pts.length;j++) ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawUltimateBeams(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const e of gs.effects){
    if(e.type!=='ultimate') continue;
    const alpha=Math.max(0,e.life/e.maxLife);
    ctx.save(); ctx.globalAlpha=alpha; ctx.lineCap='round';
    ctx.lineWidth=18*s; ctx.strokeStyle=e.color+'66'; ctx.shadowColor=e.color; ctx.shadowBlur=30;
    ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.tx,e.ty); ctx.stroke();
    ctx.lineWidth=4*s; ctx.strokeStyle='#fff'; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.tx,e.ty); ctx.stroke();
    ctx.restore();
  }
}

export function drawChainLightning(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const e of gs.effects){
    if(e.type!=='chain') continue;
    const alpha=Math.max(0,e.life/e.maxLife);
    ctx.save(); ctx.globalAlpha=alpha; ctx.lineCap='round';
    ctx.lineWidth=6*s; ctx.strokeStyle=e.color+'88'; ctx.shadowColor=e.color; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.moveTo(e.pts[0].x,e.pts[0].y);
    for(let j=1;j<e.pts.length;j++) ctx.lineTo(e.pts[j].x,e.pts[j].y); ctx.stroke();
    ctx.lineWidth=2*s; ctx.strokeStyle='#fff'; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.moveTo(e.pts[0].x,e.pts[0].y);
    for(let j=1;j<e.pts.length;j++) ctx.lineTo(e.pts[j].x,e.pts[j].y); ctx.stroke();
    ctx.restore();
  }
}

export function drawElectricSparks(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const e of gs.effects){
    if(e.type!=='electric') continue;
    const alpha=Math.max(0,e.life/e.maxLife)*.9;
    ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle='#ffee00'; ctx.shadowColor='#ffee00'; ctx.shadowBlur=10; ctx.lineWidth=2*s;
    for(let k=0;k<6;k++){
      const ang=(k/6)*Math.PI*2,r2=22*s;
      ctx.beginPath(); ctx.moveTo(e.x,e.y);
      ctx.lineTo(e.x+Math.cos(ang)*r2+(Math.random()-.5)*8*s,e.y+Math.sin(ang)*r2+(Math.random()-.5)*8*s);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawProjectileEntities(ctx:CanvasRenderingContext2D,gs:GameState):void{
  const s=sc(gs);
  for(const p of gs.projectiles){
    if(!p.launched) continue;
    ctx.save(); ctx.translate(p.x,p.y); ctx.globalAlpha=Math.min(1,p.life/600);
    ctx.shadowColor=p.color; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fillStyle=p.color; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5*s; ctx.stroke();
    ctx.restore();
  }
}
