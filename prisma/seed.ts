// Seed: 프론트엔드에 하드코딩된 ABILITY_DEFS 를 기준으로 Ability +
// AbilityVersion(version=1) 을 생성한다. upsert 방식이라 반복 실행해도
// 중복 생성되지 않는다.
//
// 실행: npm run db:seed  (내부적으로 tsx prisma/seed.ts)

import { PrismaClient, Archetype, TriggerType } from '../lib/generated/prisma';
import { ABILITY_DEFS } from '../data/abilityDefs';
import type { AbilityDef } from '../types';

const prisma = new PrismaClient();

// 능력 id -> 안정적 key. 엔진 dispatch(switch case id) 와 1:1 대응하는
// 사람이 읽을 수 있는 식별자.
const KEY_BY_ID: Record<number, string> = {
  0: 'lightning_barrage',
  2: 'homing_missiles',
  3: 'poison_cloud',
  4: 'tornado',
  5: 'ultimate',
  6: 'magic_orbs',
  7: 'sniper',
  8: 'grab_throw',
  9: 'awaken_smash',
  10: 'fire_crash',
  11: 'shock_crash',
  12: 'vampiric_strike',
  13: 'chain_lightning',
  14: 'shockwave',
  15: 'electric_field',
  16: 'hive_mine',
  17: 'phantom_counter',
  18: 'tidal_smash',
  19: 'arc_throw',
  20: 'frost_throw',
  21: 'rift_smash',
  22: 'strawberry_barrage',
  23: 'shadow_bind',
  24: 'landmine',
  26: 'gambler',
};

// 능력 id -> archetype. 프론트 정의에 archetype 개념이 없으므로 능력별
// 메커니즘을 근거로 명시적으로 매핑한다(추론 로직에 숨기지 않고 표로 관리).
const ARCHETYPE_BY_ID: Record<number, Archetype> = {
  0: Archetype.AUTO_BEAM, // 번개 난사 (지그재그 관통 빔)
  7: Archetype.AUTO_BEAM, // 저격 (일직선 관통)
  2: Archetype.AUTO_PROJECTILE, // 유도 미사일
  6: Archetype.AUTO_PROJECTILE, // 마법 구슬
  17: Archetype.AUTO_PROJECTILE, // 환영의 역습 (무적 후 투사체)
  19: Archetype.AUTO_PROJECTILE, // 곡사 투척
  20: Archetype.AUTO_PROJECTILE, // 서리 투척
  22: Archetype.AUTO_PROJECTILE, // 딸기 폭격
  3: Archetype.AUTO_DOT, // 독 안개
  16: Archetype.AUTO_DOT, // 벌집 지뢰 (지속 피해)
  23: Archetype.AUTO_DOT, // 그림자 결박 (감속 + 도트)
  15: Archetype.AUTO_AOE, // 전기장 (즉발 팽창)
  4: Archetype.AUTO_HAZARD, // 회오리 (이동 위험체)
  18: Archetype.AUTO_HAZARD, // 해일 강타 (쓸어가는 물결)
  5: Archetype.AUTO_NUKE, // 필살기 (단일 대상 대피해)
  24: Archetype.AUTO_TRAP, // 지뢰 매설
  // 8~14, 21, 26 은 모두 충돌 발동 근접 타격
};

function keyFor(def: AbilityDef): string {
  const k = KEY_BY_ID[def.id];
  if (!k) throw new Error(`능력 id=${def.id}(${def.name}) 에 대한 key 매핑이 없습니다. seed KEY_BY_ID 를 갱신하세요.`);
  return k;
}

function archetypeFor(def: AbilityDef): Archetype {
  if (def.type === 'collision') return Archetype.COLLISION_STRIKE;
  const a = ARCHETYPE_BY_ID[def.id];
  if (!a) throw new Error(`능력 id=${def.id}(${def.name}) 에 대한 archetype 매핑이 없습니다. seed ARCHETYPE_BY_ID 를 갱신하세요.`);
  return a;
}

// AbilityVersion.params 에 저장할 JSON. 프론트 params + 밸런스에 관계된
// 부수 수치(cd, maxHp) + 표시용 메타(emoji, color, desc) 를 함께 스냅샷한다.
function paramsFor(def: AbilityDef) {
  return {
    engineId: def.id, // 엔진 switch-case 와의 매핑 보존
    cd: def.cd,
    maxHp: def.maxHp,
    emoji: def.emoji,
    color: def.color,
    desc: def.desc,
    ...def.params,
  };
}

async function main() {
  console.log(`Seeding ${ABILITY_DEFS.length} abilities...`);

  for (const def of ABILITY_DEFS) {
    const key = keyFor(def);
    const archetype = archetypeFor(def);
    const triggerType = def.type === 'auto' ? TriggerType.AUTO : TriggerType.COLLISION;
    const params = paramsFor(def);

    // 1) Ability upsert — label/archetype/triggerType/isActive 는 갱신해도
    //    안전한 메타데이터이므로 update 에 포함한다. (수치가 아님)
    const ability = await prisma.ability.upsert({
      where: { key },
      create: { key, label: def.name, archetype, triggerType, isActive: true },
      update: { label: def.name, archetype, triggerType, isActive: true },
    });

    // 2) AbilityVersion(version=1) upsert — (abilityId, version) unique.
    //    params 는 "절대 UPDATE 하지 않는다" 원칙을 지키기 위해, 이미 존재하면
    //    create 만 스킵(update:{})한다. 수치를 바꾸려면 version=2 를 새로 INSERT.
    await prisma.abilityVersion.upsert({
      where: { abilityId_version: { abilityId: ability.id, version: 1 } },
      create: { abilityId: ability.id, version: 1, params },
      update: {}, // 기존 버전은 불변 — 덮어쓰지 않는다
    });

    console.log(`  ✓ ${key.padEnd(20)} [${archetype}] v1`);
  }

  const abilityCount = await prisma.ability.count();
  const versionCount = await prisma.abilityVersion.count();
  console.log(`Done. Ability=${abilityCount}, AbilityVersion=${versionCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
