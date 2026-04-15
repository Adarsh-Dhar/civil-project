import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import {
  ensureRaciTemplateTasks,
  isValidProjectTaskStatus,
  seedProjectTasksFromTemplate,
} from "@/lib/project-tasks";

async function getAccessibleProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return null;

  return project;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId || projectId === "undefined") {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or inaccessible" }, { status: 404 });
    }

    // Keep project tasks aligned to the hardcoded template while preserving current task status.
    await ensureRaciTemplateTasks(prisma);
    await seedProjectTasksFromTemplate(prisma, projectId);

    const tasks = await prisma.projectTask.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            proofs: true,
          },
        },
      },
      orderBy: { sequence: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get project tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    if (!projectId || projectId === "undefined") {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await getAccessibleProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or inaccessible" }, { status: 404 });
    }

    const { taskId, status } = await request.json();

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    if (!status || typeof status !== "string" || !isValidProjectTaskStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const task = await prisma.projectTask.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const updated = await tx.projectTask.update({
        where: { id: taskId },
        data: {
          status,
          startedAt: status === "in_progress" && !task.startedAt ? new Date() : task.startedAt,
          completedAt: status === "done" ? new Date() : null,
        },
      });

      await tx.auditLog.create({
        data: {
          projectId,
          userId: session.user.id,
          action: "TASK_STATUS_UPDATED",
          details: `Task ${updated.sequence} set to ${status}`,
        },
      });

      return updated;
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Update project task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
