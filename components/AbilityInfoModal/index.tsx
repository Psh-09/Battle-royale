'use client';

import type { Fighter } from '@/types';
import { ABILITY_DEFS } from '@/data/abilityDefs';

interface AbilityInfoModalProps {
  fighter: Fighter | null;
  onClose: () => void;
}

export default function AbilityInfoModal({ fighter, onClose }: AbilityInfoModalProps) {
  if (!fighter) return null;
  const ab = ABILITY_DEFS.find((a) => a.id === fighter.abilityId);
  if (!ab) return null;

  const dmgText = ab.params.damage
    ? `${ab.params.damage[0]} ~ ${ab.params.damage[1]}`
    : ab.params.dotDamage
    ? `${ab.params.dotDamage} / 틱`
    : '–';

  const typeLabel = ab.type === 'auto' ? '⏱ 자동 발동형' : '💥 충돌 발동형';
  const cdSec = (ab.cd / 1000).toFixed(ab.cd % 1000 === 0 ? 0 : 2);

  const extras: string[] = [];
  if (ab.params.aoeRadius)      extras.push(`범위 ${ab.params.aoeRadius}px`);
  if (ab.params.projectileCount) extras.push(`투사체 ${ab.params.projectileCount}발`);
  if (ab.params.stunDuration)    extras.push(`감속/스턴 ${(ab.params.stunDuration/1000).toFixed(1)}초`);
  if (ab.params.lifeStealRatio)  extras.push(`흡혈 ${(ab.params.lifeStealRatio*100).toFixed(0)}%`);
  if (ab.params.chainCount)      extras.push(`연쇄 ${ab.params.chainCount}회`);
  if (ab.params.wallBounces)     extras.push(`벽 튕김 ${ab.params.wallBounces}회`);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* modal */}
      <div
        className="relative bg-gray-950 border-2 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
        style={{ borderColor: ab.color + 'aa' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 text-lg leading-none"
        >
          ✕
        </button>

        {/* header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{ab.emoji}</span>
          <div>
            <div className="text-lg font-black" style={{ color: ab.color }}>{ab.name}</div>
            <div className="text-xs text-gray-500">{typeLabel} · 쿨타임 {cdSec}s</div>
          </div>
        </div>

        {/* desc */}
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{ab.desc}</p>

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1">최대 체력 HP</div>
            <div className="text-xl font-black text-green-400">{ab.maxHp}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-1">데미지</div>
            <div className="text-xl font-black text-red-400">{dmgText}</div>
          </div>
        </div>

        {/* extras */}
        {extras.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {extras.map((e, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: ab.color + '22', color: ab.color, border: `1px solid ${ab.color}44` }}
              >
                {e}
              </span>
            ))}
          </div>
        )}

        {/* fighter name */}
        <div className="text-xs text-gray-600 text-center border-t border-gray-800 pt-2">
          <span className="font-bold" style={{ color: fighter.color }}>{fighter.name}</span>
          {fighter.awaken && <span className="ml-1 text-orange-400">👑 각성 중</span>}
        </div>
      </div>
    </div>
  );
}
