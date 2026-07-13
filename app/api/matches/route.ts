import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';

// POST /api/matches
// 새 매치 생성. status=SETUP 으로 시작하고, seed 는 서버에서 랜덤 생성한다.
//
// body: { settings?: object, createdBy?: string | null }
export async function POST(req: Request) {
  let body: unknown = {};
  try {
    // 바디가 비어 있어도 허용
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { settings, createdBy } = (body ?? {}) as {
    settings?: unknown;
    createdBy?: unknown;
  };

  if (settings != null && (typeof settings !== 'object' || Array.isArray(settings))) {
    return NextResponse.json({ error: 'settings must be an object' }, { status: 400 });
  }
  if (createdBy != null && typeof createdBy !== 'string') {
    return NextResponse.json({ error: 'createdBy must be a string' }, { status: 400 });
  }

  // 결정론적 재현을 위한 시드 — 서버에서 생성.
  const seed = randomUUID();

  const match = await prisma.match.create({
    data: {
      status: 'SETUP',
      seed,
      settings: (settings as object | undefined) ?? {},
      createdBy: (createdBy as string | undefined) ?? null,
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}
