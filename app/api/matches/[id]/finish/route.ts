import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/matches/:id/finish
// 매치 종료 시 결과 저장.
//  - body 의 참가자별 { characterId, abilityVersionId, totalDamageDealt, placement }
//    로 MatchParticipant 들을 생성한다.
//  - abilityVersionId 는 "그 매치 당시 버전"을 직접 참조한다(중요).
//  - Match 를 FINISHED 로 업데이트하고 winnerCharacterId / endedAt 을 기록한다.
//
// body: {
//   winnerCharacterId?: string | null,
//   participants: Array<{
//     characterId: string,
//     abilityVersionId: string,
//     totalDamageDealt?: number,
//     placement?: number | null
//   }>
// }

interface ParticipantInput {
  characterId: string;
  abilityVersionId: string;
  totalDamageDealt?: number;
  placement?: number | null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { winnerCharacterId, participants } = (body ?? {}) as {
    winnerCharacterId?: unknown;
    participants?: unknown;
  };

  if (!Array.isArray(participants) || participants.length === 0) {
    return NextResponse.json({ error: 'participants (non-empty array) is required' }, { status: 400 });
  }
  if (winnerCharacterId != null && typeof winnerCharacterId !== 'string') {
    return NextResponse.json({ error: 'winnerCharacterId must be a string' }, { status: 400 });
  }

  // 참가자 입력 검증
  const rows: ParticipantInput[] = [];
  for (const [i, p] of participants.entries()) {
    if (typeof p !== 'object' || p === null) {
      return NextResponse.json({ error: `participants[${i}] must be an object` }, { status: 400 });
    }
    const { characterId, abilityVersionId, totalDamageDealt, placement } = p as Record<string, unknown>;
    if (typeof characterId !== 'string') {
      return NextResponse.json({ error: `participants[${i}].characterId is required` }, { status: 400 });
    }
    if (typeof abilityVersionId !== 'string') {
      return NextResponse.json({ error: `participants[${i}].abilityVersionId is required` }, { status: 400 });
    }
    if (totalDamageDealt != null && (typeof totalDamageDealt !== 'number' || !Number.isFinite(totalDamageDealt))) {
      return NextResponse.json({ error: `participants[${i}].totalDamageDealt must be a number` }, { status: 400 });
    }
    if (placement != null && (typeof placement !== 'number' || !Number.isInteger(placement))) {
      return NextResponse.json({ error: `participants[${i}].placement must be an integer` }, { status: 400 });
    }
    rows.push({
      characterId,
      abilityVersionId,
      totalDamageDealt: (totalDamageDealt as number | undefined) ?? 0,
      placement: (placement as number | null | undefined) ?? null,
    });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    return NextResponse.json({ error: 'match not found' }, { status: 404 });
  }
  if (match.status === 'FINISHED') {
    return NextResponse.json({ error: 'match already finished' }, { status: 409 });
  }

  // 참가자 생성 + 매치 종료를 하나의 트랜잭션으로 원자적 처리.
  try {
    const [, updated] = await prisma.$transaction([
      prisma.matchParticipant.createMany({
        data: rows.map((r) => ({
          matchId: id,
          characterId: r.characterId,
          abilityVersionId: r.abilityVersionId,
          totalDamageDealt: r.totalDamageDealt ?? 0,
          placement: r.placement ?? null,
        })),
      }),
      prisma.match.update({
        where: { id },
        data: {
          status: 'FINISHED',
          endedAt: new Date(),
          winnerCharacterId: (winnerCharacterId as string | undefined) ?? null,
        },
      }),
    ]);

    return NextResponse.json({ match: updated, participantCount: rows.length });
  } catch (e) {
    // FK 위반(존재하지 않는 characterId / abilityVersionId 등)
    return NextResponse.json(
      { error: 'failed to save result — check characterId / abilityVersionId references', detail: String(e) },
      { status: 400 },
    );
  }
}
