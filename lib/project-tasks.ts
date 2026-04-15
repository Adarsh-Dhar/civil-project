import type { PrismaClient } from "../app/generated/prisma/client";
import { RACI_TEMPLATE_TASKS } from "@/lib/raci-template";

type ProjectTaskPrisma = Pick<PrismaClient, "projectTaskTemplate" | "projectTask">;

type EnsureRaciTemplateTasksOptions = {
  forceReset?: boolean;
};

export const PROJECT_TASK_STATUSES = ["pending", "in_progress", "blocked", "done"] as const;

export type ProjectTaskStatus = (typeof PROJECT_TASK_STATUSES)[number];

export function isValidProjectTaskStatus(value: string): value is ProjectTaskStatus {
  return PROJECT_TASK_STATUSES.includes(value as ProjectTaskStatus);
}

export async function ensureRaciTemplateTasks(
  prisma: ProjectTaskPrisma,
  options: EnsureRaciTemplateTasksOptions = {}
) {
  const templateCount = await prisma.projectTaskTemplate.count();
  if (templateCount > 0 && !options.forceReset) {
    return;
  }

  const sequences = RACI_TEMPLATE_TASKS.map((task) => task.sequence);

  await prisma.projectTaskTemplate.deleteMany({
    where: {
      sequence: {
        notIn: sequences,
      },
    },
  });

  for (const task of RACI_TEMPLATE_TASKS) {
    await prisma.projectTaskTemplate.upsert({
      where: { sequence: task.sequence },
      update: {
        stage: task.stage,
        name: task.name,
        responsible: task.responsible,
        accountable: task.accountable,
        consulted: task.consulted,
        informed: task.informed,
        costCr: task.costCr,
        timeDays: task.timeDays,
        costWeight: task.costWeight,
        timeWeight: task.timeWeight,
      },
      create: {
        sequence: task.sequence,
        stage: task.stage,
        name: task.name,
        responsible: task.responsible,
        accountable: task.accountable,
        consulted: task.consulted,
        informed: task.informed,
        costCr: task.costCr,
        timeDays: task.timeDays,
        costWeight: task.costWeight,
        timeWeight: task.timeWeight,
      },
    });
  }
}

export async function seedProjectTasksFromTemplate(prisma: ProjectTaskPrisma, projectId: string) {
  await ensureRaciTemplateTasks(prisma);

  const dataSource = await prisma.projectTaskTemplate.findMany({
    orderBy: { sequence: "asc" },
  });

  if (dataSource.length === 0) {
    throw new Error("No RACI task templates are available");
  }

  const sequences = dataSource.map((task) => task.sequence);

  await prisma.projectTask.deleteMany({
    where: {
      projectId,
      sequence: {
        notIn: sequences,
      },
    },
  });

  for (const t of dataSource) {
    await prisma.projectTask.upsert({
      where: {
        projectId_sequence: {
          projectId,
          sequence: t.sequence,
        },
      },
      update: {
        templateId: t.id,
        stage: t.stage,
        name: t.name,
        responsible: t.responsible,
        accountable: t.accountable,
        consulted: t.consulted,
        informed: t.informed,
        costCr: t.costCr,
        timeDays: t.timeDays,
        costWeight: t.costWeight,
        timeWeight: t.timeWeight,
      },
      create: {
        projectId,
        templateId: t.id,
        sequence: t.sequence,
        stage: t.stage,
        name: t.name,
        responsible: t.responsible,
        accountable: t.accountable,
        consulted: t.consulted,
        informed: t.informed,
        costCr: t.costCr,
        timeDays: t.timeDays,
        costWeight: t.costWeight,
        timeWeight: t.timeWeight,
        status: "pending",
      },
    });
  }
}
