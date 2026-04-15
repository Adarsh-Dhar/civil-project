import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { importRaciTasks, parseRaciWorkbookBuffer } from "@/lib/raci-import";

function parseArgs(argv: string[]) {
  const args = {
    file: "pd lab.xlsx",
    projectId: undefined as string | undefined,
    applyToAllProjects: false,
    applyStatusFromFile: true,
  };

  for (const arg of argv) {
    if (arg.startsWith("--file=")) {
      args.file = arg.slice("--file=".length);
    } else if (arg.startsWith("--projectId=")) {
      args.projectId = arg.slice("--projectId=".length);
    } else if (arg === "--all-projects") {
      args.applyToAllProjects = true;
    } else if (arg === "--no-status") {
      args.applyStatusFromFile = false;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(process.cwd(), args.file);

  const buffer = await fs.readFile(filePath);
  const parsed = parseRaciWorkbookBuffer(buffer);

  const result = await importRaciTasks(prisma, parsed.tasks, {
    projectId: args.projectId,
    applyToAllProjects: args.applyToAllProjects,
    applyStatusFromFile: args.applyStatusFromFile,
    replaceTemplates: true,
    replaceProjectTasks: true,
  });

  console.log("RACI import completed", {
    file: filePath,
    sheet: parsed.sheetName,
    rowsRead: parsed.totalRows,
    tasksImported: parsed.tasks.length,
    ...result,
  });
}

main()
  .catch((error) => {
    console.error("RACI import failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
