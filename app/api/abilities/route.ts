import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/abilities
// 활성화된(isActive=true) 능력들의 "최신 버전" 정보를 반환한다.
// 최신 버전 = version 값이 가장 큰 AbilityVersion 한 개.
export async function GET() {
  const abilities = await prisma.ability.findMany({
    where: { isActive: true },
    orderBy: { key: 'asc' },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  });

  const result = abilities
    // 버전이 하나도 없는 능력은 노출하지 않는다(방어적)
    .filter((a) => a.versions.length > 0)
    .map((a) => {
      const latest = a.versions[0];
      return {
        id: a.id,
        key: a.key,
        label: a.label,
        archetype: a.archetype,
        triggerType: a.triggerType,
        version: {
          id: latest.id,
          version: latest.version,
          params: latest.params,
          effectiveFrom: latest.effectiveFrom,
        },
      };
    });

  return NextResponse.json({ abilities: result });
}
