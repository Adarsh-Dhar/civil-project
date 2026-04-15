import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { ensureRaciTemplateTasks, seedProjectTasksFromTemplate } from "../lib/project-tasks";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  await ensureRaciTemplateTasks(prisma);

  const role = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "seed.admin@civil.local" },
    update: {
      name: "Seed Admin",
      roleId: role.id,
      onboardingCompleted: true,
    },
    create: {
      email: "seed.admin@civil.local",
      name: "Seed Admin",
      password: passwordHash,
      roleId: role.id,
      onboardingCompleted: true,
      preferences: { theme: "light", locale: "en" },
    },
  });

  const teamName = "Seed Team";
  let team = await prisma.team.findFirst({ where: { name: teamName } });

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: teamName,
        description: "Deterministic team created by prisma/seed.ts",
        members: {
          connect: { id: user.id },
        },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { teamId: team.id },
    });
  }

  let project = await prisma.project.findFirst({
    where: {
      ownerId: user.id,
      name: "Seed Project",
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Seed Project",
        description: "Project created by deterministic seed",
        status: "active",
        ownerId: user.id,
        teamId: team.id,
      },
    });
  }

  await seedProjectTasksFromTemplate(prisma, project.id);

  const existingAuditCount = await prisma.auditLog.count({
    where: { projectId: project.id },
  });

  if (existingAuditCount === 0) {
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userId: user.id,
        action: "SEED_CREATED",
        details: "Initial seed activity",
      },
    });
  }

  console.log("Seed completed", {
    userId: user.id,
    teamId: team.id,
    projectId: project.id,
    taskTemplateCount: await prisma.projectTaskTemplate.count(),
    taskCount: await prisma.projectTask.count({ where: { projectId: project.id } }),
  });
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
