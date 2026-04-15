import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { importRaciTasks, parseRaciWorkbookBuffer } from "@/lib/raci-import";

function toBoolean(value: FormDataEntryValue | null, defaultValue = false) {
  if (value === null) {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }

    const isExcel =
      fileEntry.type.includes("spreadsheet") ||
      fileEntry.name.toLowerCase().endsWith(".xlsx") ||
      fileEntry.name.toLowerCase().endsWith(".xls");

    if (!isExcel) {
      return NextResponse.json({ error: "Only .xlsx/.xls files are supported" }, { status: 400 });
    }

    const projectIdEntry = formData.get("projectId");
    const projectId = typeof projectIdEntry === "string" && projectIdEntry.trim().length > 0
      ? projectIdEntry.trim()
      : undefined;

    const applyToAllProjects = toBoolean(formData.get("applyToAllProjects"), false);
    const applyStatusFromFile = toBoolean(formData.get("applyStatusFromFile"), true);

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const parsed = parseRaciWorkbookBuffer(buffer);

    if (parsed.tasks.length === 0) {
      return NextResponse.json({ error: "No tasks found in uploaded workbook" }, { status: 400 });
    }

    const imported = await importRaciTasks(prisma, parsed.tasks, {
      projectId,
      applyToAllProjects,
      applyStatusFromFile,
      replaceTemplates: true,
      replaceProjectTasks: true,
    });

    return NextResponse.json({
      ok: true,
      fileName: fileEntry.name,
      sheetName: parsed.sheetName,
      rowsRead: parsed.totalRows,
      tasksImported: parsed.tasks.length,
      ...imported,
    });
  } catch (error) {
    console.error("RACI import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to import RACI workbook",
      },
      { status: 500 }
    );
  }
}
