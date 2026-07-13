-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('AUTO', 'COLLISION');

-- CreateEnum
CREATE TYPE "Archetype" AS ENUM ('AUTO_BEAM', 'AUTO_PROJECTILE', 'AUTO_DOT', 'AUTO_AOE', 'AUTO_HAZARD', 'AUTO_NUKE', 'AUTO_TRAP', 'COLLISION_STRIKE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SETUP', 'RUNNING', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "guestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "archetype" "Archetype" NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbilityVersion" (
    "id" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "params" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbilityVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'SETUP',
    "settings" JSONB NOT NULL,
    "seed" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "winnerCharacterId" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "abilityVersionId" TEXT NOT NULL,
    "totalDamageDealt" INTEGER NOT NULL DEFAULT 0,
    "placement" INTEGER,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_guestId_key" ON "User"("guestId");

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_key_key" ON "Ability"("key");

-- CreateIndex
CREATE INDEX "AbilityVersion_abilityId_idx" ON "AbilityVersion"("abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "AbilityVersion_abilityId_version_key" ON "AbilityVersion"("abilityId", "version");

-- CreateIndex
CREATE INDEX "Match_createdBy_idx" ON "Match"("createdBy");

-- CreateIndex
CREATE INDEX "MatchParticipant_matchId_idx" ON "MatchParticipant"("matchId");

-- CreateIndex
CREATE INDEX "MatchParticipant_characterId_idx" ON "MatchParticipant"("characterId");

-- CreateIndex
CREATE INDEX "MatchParticipant_abilityVersionId_idx" ON "MatchParticipant"("abilityVersionId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityVersion" ADD CONSTRAINT "AbilityVersion_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerCharacterId_fkey" FOREIGN KEY ("winnerCharacterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_abilityVersionId_fkey" FOREIGN KEY ("abilityVersionId") REFERENCES "AbilityVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
