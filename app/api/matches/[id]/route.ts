import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches/:id
// 매치 결과 조회. 참가자 목록과, 각 참가자가 사용한 능력의 "그 시점 버전"
// (AbilityVersion + 상위 Ability 메타)까지 조인해서 반환한다.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      winner: true,
      participants: {
        include: {
          character: true,
          // 매치 당시 버전 → 그 버전이 속한 능력 메타까지 조인
          abilityVersion: {
            include: { ability: true },
          },
        },
        orderBy: { placement: 'asc' },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ error: 'match not found' }, { status: 404 });
  }

  // 참가자 응답을 사용처가 쓰기 쉬운 형태로 정리.
  const participants = match.participants.map((p) => ({
    id: p.id,
    character: {
      id: p.character.id,
      name: p.character.name,
      imageUrl: p.character.imageUrl,
    },
    totalDamageDealt: p.totalDamageDealt,
    placement: p.placement,
    ability: {
      id: p.abilityVersion.ability.id,
      key: p.abilityVersion.ability.key,
      label: p.abilityVersion.ability.label,
      archetype: p.abilityVersion.ability.archetype,
      triggerType: p.abilityVersion.ability.triggerType,
      // 현재 버전이 아니라 매치 당시 버전
      version: {
        id: p.abilityVersion.id,
        version: p.abilityVersion.version,
        params: p.abilityVersion.params,
        effectiveFrom: p.abilityVersion.effectiveFrom,
      },
    },
  }));

  return NextResponse.json({
    match: {
      id: match.id,
      status: match.status,
      seed: match.seed,
      settings: match.settings,
      createdBy: match.createdBy,
      winnerCharacterId: match.winnerCharacterId,
      winner: match.winner
        ? { id: match.winner.id, name: match.winner.name, imageUrl: match.winner.imageUrl }
        : null,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      participants,
    },
  });
}
