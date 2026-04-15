import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "@/lib/auth";

async function getAccessibleTask(projectId: string, taskId: string) {
  const task = await prisma.projectTask.findFirst({
    where: {
      id: taskId,
      projectId,
    },
  });

  return task;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, taskId } = await params;
    if (!projectId || !taskId || projectId === "undefined" || taskId === "undefined") {
      return NextResponse.json({ error: "Invalid task request" }, { status: 400 });
    }

    const task = await getAccessibleTask(projectId, taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found or inaccessible" }, { status: 404 });
    }

    const proofs = await prisma.taskProof.findMany({
      where: {
        projectId,
        taskId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error("Get task proofs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, taskId } = await params;
    if (!projectId || !taskId || projectId === "undefined" || taskId === "undefined") {
      return NextResponse.json({ error: "Invalid task request" }, { status: 400 });
    }

    const task = await getAccessibleTask(projectId, taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found or inaccessible" }, { status: 404 });
    }

    const { fileUrl, type, note } = await request.json();

    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
    }

    const proof = await prisma.$transaction(async (tx) => {
      const created = await tx.taskProof.create({
        data: {
          projectId,
          taskId,
          fileUrl,
          type: typeof type === "string" && type.length > 0 ? type : "document",
          note: typeof note === "string" ? note : null,
          uploadedBy: session.user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          projectId,
          userId: session.user.id,
          action: "TASK_PROOF_ADDED",
          details: `Proof added for task ${task.sequence}`,
        },
      });

      return created;
    });

    return NextResponse.json({ proof }, { status: 201 });
  } catch (error) {
    console.error("Create task proof error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
