'use client';

import type { Fighter } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface HpRailProps { fighters: Fighter[]; }

export default function HpRail({ fighters }: HpRailProps) {
  return (
    <div className="grid gap-1.5 w-full" style={{gridTemplateColumns:`repeat(${Math.min(fighters.length,4)},1fr)`}}>
      {fighters.map((f) => {
        const ab=ABILITY_DEFS.find(a=>a.id===f.abilityId);
        const hpPct=(f.hp/f.maxHp)*100, lagPct=(f.hpLag/f.maxHp)*100;
        const hpColor=hpPct>50?'#3dba50':hpPct>25?'#f0c040':'#cc3333';
        return (
          <div key={f.id} className="min-w-0">
            <div className="text-[10px] font-bold truncate mb-0.5" style={{color:f.dead?'#333':f.color}}>
              {f.dead?'💀 ':ab?ab.emoji+' ':''}{f.name}{f.awaken&&!f.dead&&<span className="text-orange-500 ml-1">🐲</span>}
            </div>
            <div className="relative h-3 bg-black/80 rounded-sm overflow-hidden border border-white/10">
              <div className="absolute inset-y-0 left-0 rounded-sm" style={{width:`${lagPct}%`,background:'#3a3a3a'}}/>
              <div className="absolute inset-y-0 left-0 rounded-sm" style={{width:`${hpPct}%`,background:hpColor}}/>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/90" style={{textShadow:'0 0 3px #000'}}>
                {Math.ceil(f.hp)}/{f.maxHp}
              </span>
            </div>
            {ab&&!f.dead&&(
              <div className="mt-0.5 h-1 bg-gray-800 rounded-sm overflow-hidden">
                <div className="h-full rounded-sm" style={{width:`${Math.max(0,Math.min(100,(1-f.abilityCd/ab.cd)*100))}%`,background:ab.color}}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
