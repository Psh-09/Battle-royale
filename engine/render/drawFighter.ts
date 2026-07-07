import type { Fighter, GameState } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';

const sc=(gs:GameState)=>gs.fieldSize/500;

export function drawFighter(ctx:CanvasRenderingContext2D,gs:GameState,f:Fighter):void{
  if(f.dead) return;
  const s=sc(gs),r=gs.baseR*s;
  const fl=f.flash>0&&Math.floor(f.flash/60)%2===1;
  const ab=ABILITY_DEFS.find(a=>a.id===f.abilityId);
  ctx.save(); ctx.translate(f.x,f.y);

  // 최후의 저항 비주얼 (황금 맥동 링)
  if(f.lastStandActive){
    const t=Date.now()/150;
    for(let ri=0;ri<2;ri++){
      ctx.beginPath();ctx.arc(0,0,r*(2.2+ri*.4),0,Math.PI*2);
      ctx.strokeStyle=`rgba(255,220,0,${.7-.25*ri+.25*Math.sin(t*(8-ri*2))})`;
      ctx.lineWidth=(5-ri*2)*s;ctx.stroke();
    }
    // 황금 텍스트 오라
    ctx.font=`${r*.6}px serif`;ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.shadowColor='#ffdd00';ctx.shadowBlur=12*s;
    ctx.fillStyle='#ffdd00';ctx.fillText('⚡',r*.7,-r-.5*s);ctx.shadowBlur=0;
  }
  if(f.awaken){
    const t=Date.now()/600; // 더 빠른 펄스
    // 3겹 오라 링
    ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,20,0,${.7+.25*Math.sin(t*8)})`;ctx.lineWidth=5*s;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*1.6,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,80,0,${.55+.25*Math.sin(t*5)})`;ctx.lineWidth=3.5*s;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*2.0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(255,200,0,${.3+.15*Math.sin(t*3+1)})`;ctx.lineWidth=2*s;ctx.stroke();
    // 👑 왕관 (머리 위)
    ctx.font=`${r*.85}px serif`;ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.shadowColor='#ff4400';ctx.shadowBlur=10*s;
    ctx.fillStyle='#fff';ctx.fillText('👑',0,-r-2*s);ctx.shadowBlur=0;
    // 빨간 눈 효과
    if(!fl){
      ctx.fillStyle='#ff1100';ctx.shadowColor='#ff0000';ctx.shadowBlur=6*s;
      ctx.beginPath();ctx.arc(-r*.28,-r*.12,3.5*s,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc( r*.28,-r*.12,3.5*s,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    }
  }
  if(f.stunned>0){
    const t=Date.now()/80; ctx.fillStyle='#ffee00';
    for(let k=0;k<5;k++){const a=(k/5)*Math.PI*2+t;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.4,Math.sin(a)*r*1.4,3*s,0,Math.PI*2);ctx.fill();}
  }
  if(f.poisonTimer>0){ctx.beginPath();ctx.arc(0,0,r*1.1,0,Math.PI*2);ctx.strokeStyle='rgba(50,200,80,.5)';ctx.lineWidth=3*s;ctx.stroke();}
  if(f.isGrabbed){ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);ctx.strokeStyle=`rgba(255,200,0,${.5+.4*Math.sin(Date.now()/80)})`;ctx.lineWidth=3*s;ctx.stroke();}

  // Frost/slow visual
  if(f.slowed>0){
    const frozenPulse=0.6+0.3*Math.sin(Date.now()/100);
    ctx.beginPath();ctx.arc(0,0,r*1.15,0,Math.PI*2);
    ctx.strokeStyle=`rgba(100,200,255,${frozenPulse})`;ctx.lineWidth=3*s;ctx.stroke();
  }

  // Phantom (near-invisible)
  if(f.phantom>0){
    ctx.globalAlpha=0.2;
  }

  if(ab){
    const cdPct=Math.max(0,1-f.abilityCd/ab.cd);
    if(cdPct>=1){ctx.beginPath();ctx.arc(0,0,r+5*s,0,Math.PI*2);ctx.strokeStyle='#ffd70055';ctx.lineWidth=2*s;ctx.setLineDash([4*s,3*s]);ctx.stroke();ctx.setLineDash([]);}
    else if(cdPct>0){ctx.beginPath();ctx.arc(0,0,r+4*s,-Math.PI/2,-Math.PI/2+cdPct*Math.PI*2);ctx.strokeStyle=(ab.color??f.color)+'99';ctx.lineWidth=2*s;ctx.stroke();}
  }

  const gr=ctx.createRadialGradient(0,0,r*.4,0,0,r+9*s);
  gr.addColorStop(0,f.color+'33');gr.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(0,0,r+9*s,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();

  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  // 각성 시 어두운 붉은 배경 → 각성 전후 한눈에 구분
  ctx.fillStyle=fl?'#ffffff22':f.awaken?'#1a0300':'#0e1420';ctx.fill();
  ctx.lineWidth=3.2*s;ctx.strokeStyle=fl?'#fff':f.awaken?'#ff1100':f.color;ctx.stroke();

  if(f.imageEl&&f.imageEl.complete){
    ctx.save();ctx.beginPath();ctx.arc(0,0,r-2*s,0,Math.PI*2);ctx.clip();
    ctx.drawImage(f.imageEl,-r+2*s,-r+2*s,(r-2*s)*2,(r-2*s)*2);ctx.restore();
  } else {
    ctx.font=`${r*.85}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,.7)';ctx.shadowBlur=4*s;ctx.fillStyle='#fff';ctx.fillText(f.emoji,0,1*s);ctx.shadowBlur=0;
  }

  if(ab){ctx.font=`${r*.48}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(ab.emoji,r*.7,-r*.7);}

  // Reset alpha if it was set for phantom
  if(f.phantom>0) ctx.globalAlpha=1;

  const bw=r*1.9,bh=5*s,bx=-bw/2,by=r+4*s;
  ctx.fillStyle='#111';ctx.fillRect(bx,by,bw,bh);
  const pct=f.hp/f.maxHp;
  ctx.fillStyle=pct>.5?'#3dba50':pct>.25?'#f0c040':'#cc3333';
  ctx.fillRect(bx,by,bw*pct,bh);

  const nameSize=Math.max(8,10*s);
  ctx.font=`bold ${nameSize}px 'Segoe UI',Arial,sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='top';ctx.shadowColor='#000';ctx.shadowBlur=3;
  ctx.fillStyle=f.color;ctx.fillText(f.name,0,by+bh+2*s);ctx.shadowBlur=0;

  ctx.restore();
}
