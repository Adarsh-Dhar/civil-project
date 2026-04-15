import * as XLSX from "xlsx";
import type { PrismaClient } from "../app/generated/prisma/client";
import type { ProjectTaskStatus } from "@/lib/project-tasks";

export type ImportedRaciTask = {
  sequence: number;
  stage: string;
  name: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  costCr: number;
  timeDays: number;
  costWeight: number;
  timeWeight: number;
  status: ProjectTaskStatus;
};

type ImportPrisma = Pick<
  PrismaClient,
  "$transaction" | "projectTaskTemplate" | "projectTask" | "project"
>;

export type ImportRaciOptions = {
  projectId?: string;
  applyToAllProjects?: boolean;
  applyStatusFromFile?: boolean;
  replaceTemplates?: boolean;
  replaceProjectTasks?: boolean;
};

const DEFAULT_STATUS: ProjectTaskStatus = "pending";

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function toTrimmedString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = toTrimmedString(value);
  if (!raw) {
    return null;
  }

  const cleaned = raw
    .replace(/,/g, "")
    .replace(/₹/g, "")
    .replace(/cr/gi, "")
    .replace(/days?/gi, "")
    .trim();

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
}

function toWeight(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1 ? value / 100 : value;
  }

  const raw = toTrimmedString(value);
  if (!raw) {
    return null;
  }

  if (raw.includes("%")) {
    const num = Number(raw.replace(/%/g, "").trim());
    return Number.isFinite(num) ? num / 100 : null;
  }

  const parsed = Number(raw.replace(/,/g, "").trim());
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed > 1 ? parsed / 100 : parsed;
}

function toStatus(value: unknown): ProjectTaskStatus {
  const raw = toTrimmedString(value).toLowerCase();

  if (raw.includes("done") || raw.includes("complete")) {
    return "done";
  }

  if (raw.includes("block")) {
    return "blocked";
  }

  if (raw.includes("progress") || raw.includes("ongoing") || raw.includes("active")) {
    return "in_progress";
  }

  return DEFAULT_STATUS;
}

function getByAliases(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);
  const normalizedPairs = keys.map((key) => ({
    key,
    normalized: normalizeKey(key),
  }));

  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);

    const exact = normalizedPairs.find((pair) => pair.normalized === normalizedAlias);
    if (exact) {
      return row[exact.key];
    }

    if (normalizedAlias.length >= 3) {
      const fuzzy = normalizedPairs.find(
        (pair) => pair.normalized.includes(normalizedAlias) || normalizedAlias.includes(pair.normalized)
      );
      if (fuzzy) {
        return row[fuzzy.key];
      }
    }
  }

  return undefined;
}

export function parseRaciWorkbookBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Workbook has no sheets");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  });

  const parsed: ImportedRaciTask[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    const stage = toTrimmedString(getByAliases(row, ["stage", "phase"]));
    const name = toTrimmedString(getByAliases(row, ["task", "activity", "name", "description"]));

    if (!stage && !name) {
      continue;
    }

    const sequenceValue = toNumber(getByAliases(row, ["#", "sno", "sr no", "srno", "sequence", "id", "no"]));
    const costValue = toNumber(getByAliases(row, ["cost (cr)", "cost", "costcr", "budget", "cost in cr"]));
    const timeValue = toNumber(getByAliases(row, ["time (days)", "time", "days", "duration", "duration days"]));

    const task: ImportedRaciTask = {
      sequence: sequenceValue && sequenceValue > 0 ? Math.round(sequenceValue) : parsed.length + 1,
      stage: stage || "General",
      name: name || `Task ${parsed.length + 1}`,
      responsible:
        toTrimmedString(
          getByAliases(row, ["responsible", "responsible (r)", "responsibility", "r"])
        ) || "TBD",
      accountable:
        toTrimmedString(getByAliases(row, ["accountable", "accountable (a)", "a"])) || "TBD",
      consulted:
        toTrimmedString(getByAliases(row, ["consulted", "consulted (c)", "c"])) || "TBD",
      informed:
        toTrimmedString(getByAliases(row, ["informed", "informed (i)", "i"])) || "TBD",
      costCr: costValue && costValue > 0 ? costValue : 0,
      timeDays: timeValue && timeValue > 0 ? Math.round(timeValue) : 0,
      costWeight: toWeight(getByAliases(row, ["cost wt", "cost weight", "costwt", "cw", "cost %"])) ?? 0,
      timeWeight: toWeight(getByAliases(row, ["time wt", "time weight", "timewt", "tw", "time %"])) ?? 0,
      status: toStatus(getByAliases(row, ["status", "state", "task status"])),
    };

    parsed.push(task);
  }

  if (parsed.length === 0) {
    throw new Error("No task rows found in workbook");
  }

  const totalCost = parsed.reduce((sum, task) => sum + task.costCr, 0);
  const totalTime = parsed.reduce((sum, task) => sum + task.timeDays, 0);

  for (const task of parsed) {
    if (task.costWeight <= 0 && totalCost > 0) {
      task.costWeight = task.costCr / totalCost;
    }

    if (task.timeWeight <= 0 && totalTime > 0) {
      task.timeWeight = task.timeDays / totalTime;
    }
  }

  // Preserve all imported rows, even if the source has duplicate Sr No values.
  const used = new Set<number>();
  const tasks = parsed
    .map((task) => {
      let sequence = task.sequence;
      while (used.has(sequence)) {
        sequence += 1;
      }
      used.add(sequence);
      return {
        ...task,
        sequence,
      };
    })
    .sort((a, b) => a.sequence - b.sequence);

  return {
    sheetName: firstSheetName,
    totalRows: rows.length,
    tasks,
  };
}

export async function importRaciTasks(
  prisma: ImportPrisma,
  tasks: ImportedRaciTask[],
  options: ImportRaciOptions = {}
) {
  if (tasks.length === 0) {
    throw new Error("No tasks to import");
  }

  const sequences = tasks.map((task) => task.sequence);
  const applyStatusFromFile = options.applyStatusFromFile ?? true;
  const replaceTemplates = options.replaceTemplates ?? true;
  const replaceProjectTasks = options.replaceProjectTasks ?? true;

  const result = await prisma.$transaction(async (tx) => {
    if (replaceTemplates) {
      await tx.projectTaskTemplate.deleteMany({
        where: {
          sequence: {
            notIn: sequences,
          },
        },
      });
    }

    const templateIdBySequence = new Map<number, string>();

    for (const task of tasks) {
      const template = await tx.projectTaskTemplate.upsert({
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

      templateIdBySequence.set(task.sequence, template.id);
    }

    let projectIds: string[] = [];
    if (options.applyToAllProjects) {
      const projects = await tx.project.findMany({ select: { id: true } });
      projectIds = projects.map((project) => project.id);
    } else if (options.projectId) {
      projectIds = [options.projectId];
    }

    for (const projectId of projectIds) {
      if (replaceProjectTasks) {
        await tx.projectTask.deleteMany({
          where: {
            projectId,
            sequence: {
              notIn: sequences,
            },
          },
        });
      }

      for (const task of tasks) {
        await tx.projectTask.upsert({
          where: {
            projectId_sequence: {
              projectId,
              sequence: task.sequence,
            },
          },
          update: {
            templateId: templateIdBySequence.get(task.sequence) ?? null,
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
            ...(applyStatusFromFile ? { status: task.status } : {}),
          },
          create: {
            projectId,
            templateId: templateIdBySequence.get(task.sequence) ?? null,
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
            status: applyStatusFromFile ? task.status : DEFAULT_STATUS,
          },
        });
      }
    }

    return {
      templateCount: tasks.length,
      projectsUpdated: projectIds.length,
      projectTaskUpserts: projectIds.length * tasks.length,
    };
  });

  return result;
}
