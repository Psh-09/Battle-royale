import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/characters
// 캐릭터(로스터 슬롯) 저장.
// 이미지 스토리지 연동은 다음 단계 — 지금은 imageUrl 로 URL 문자열만 받는다.
//
// body: { name: string, imageUrl?: string | null, userId?: string | null }
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { name, imageUrl, userId } = (body ?? {}) as {
    name?: unknown;
    imageUrl?: unknown;
    userId?: unknown;
  };

  if (typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (imageUrl != null && typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'imageUrl must be a string URL' }, { status: 400 });
  }
  if (userId != null && typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId must be a string' }, { status: 400 });
  }

  const character = await prisma.character.create({
    data: {
      name: name.trim(),
      imageUrl: (imageUrl as string | undefined) ?? null,
      userId: (userId as string | undefined) ?? null,
    },
  });

  return NextResponse.json({ character }, { status: 201 });
}
