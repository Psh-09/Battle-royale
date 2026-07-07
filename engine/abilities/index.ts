import type { Fighter, GameState, GameCallbacks } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';
import { ab_laser,ab_missiles,ab_poison,ab_tornado,ab_ultimate,ab_orbs,ab_sniper,ab_electricField } from './autoAbilities';
import { ab_throw,ab_awaken,ab_firecrash,ab_electric,ab_vampiric,ab_chainLightning,ab_shockwave } from './collisionAbilities';

export function checkAutoAbility(gs: GameState, cbs: GameCallbacks, c: Fighter): void {
  const ab=ABILITY_DEFS.find(a=>a.id===c.abilityId);
  if (!ab||ab.type!=='auto') return;
  if (c.abilityCd>0) return;
  const alive=gs.fighters.filter(f=>!f.dead&&f!==c);
  if (!alive.length&&ab.id!==3&&ab.id!==4){c.abilityCd=ab.cd;return;}
  fireAutoAbility(gs,cbs,c);
  c.abilityCd=ab.cd;
}

function fireAutoAbility(gs: GameState, cbs: GameCallbacks, c: Fighter): void {
  switch(c.abilityId){
    case 0: ab_laser(gs,cbs,c); break;
    // case 1: 화염폭발 제거됨
    case 2: ab_missiles(gs,cbs,c); break;
    case 3: ab_poison(gs,cbs,c); break;
    case 4: ab_tornado(gs,cbs,c); break;
    case 5: ab_ultimate(gs,cbs,c); break;
    case 6: ab_orbs(gs,cbs,c); break;
    case 7: ab_sniper(gs,cbs,c); break;
    case 15: ab_electricField(gs,cbs,c); break;
  }
}

export function fireCollisionAbility(gs: GameState, cbs: GameCallbacks, att: Fighter, def: Fighter): void {
  switch(att.abilityId){
    case 8:  ab_throw(gs,cbs,att,def); break;
    case 9:  ab_awaken(gs,cbs,att,def); break;
    case 10: ab_firecrash(gs,cbs,att,def); break;
    case 11: ab_electric(gs,cbs,att,def); break;
    case 12: ab_vampiric(gs,cbs,att,def); break;
    case 13: ab_chainLightning(gs,cbs,att,def); break;
    case 14: ab_shockwave(gs,cbs,att,def); break;
  }
}
