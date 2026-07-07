export const BASE_FIELD = 500;
export const BASE_R = 27;
export const BASE_SPEED = 150;
export const BASE_KB_SPD = 560;
export const HP_LAG_RATE = 0.055;

export const PARTICLE_COLORS = [
  '#ff6b6b','#ffd700','#00e5ff','#ff69b4','#7fff00',
  '#ff8c00','#da70d6','#ffffff','#88ffcc',
];

export const FIGHTER_COLORS = [
  '#4a8fe2','#e040fb','#ff6022','#20c890','#e86820',
  '#e04050','#00ccff','#d4a820','#9b59b6','#3dba50',
  '#ff4444','#44ddff','#ffaa00','#cc66ff','#66ff88','#ff8866',
];

export const FALLBACK_EMOJIS = [
  '⚔️','🗡️','🥋','🌀','🦾','💪','🤛','👊',
  '🥊','🦶','🤺','🛡️','🏹','🔱','⚡','🔥',
];

export function charRadius(n: number): number {
  if (n <= 2) return 27;
  if (n <= 3) return 24;
  if (n <= 5) return 21;
  if (n <= 8) return 18;
  if (n <= 12) return 15;
  return 13;
}
