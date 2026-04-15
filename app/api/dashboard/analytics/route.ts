import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

const STAGE_ORDER = ["DPR", "LA", "Tender", "Pre-Con", "Design", "Construction", "Post"];

export async function GET() {
  try {
    const session = (await getServerSession(authConfig)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await prisma.projectTask.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { team: { members: { some: { id: userId } } } },
          ],
        },
      },
      select: {
        stage: true,
        status: true,
        completedAt: true,
      },
    });

    const stageMap = new Map<string, { total: number; done: number }>();
    for (const stage of STAGE_ORDER) {
      stageMap.set(stage, { total: 0, done: 0 });
    }

    for (const task of tasks) {
      const current = stageMap.get(task.stage) ?? { total: 0, done: 0 };
      current.total += 1;
      if (task.status === "done") {
        current.done += 1;
      }
      stageMap.set(task.stage, current);
    }

    const stageCompletion = Array.from(stageMap.entries()).map(([stage, value]) => ({
      stage,
      completed: value.done,
      total: value.total,
      completionPercent: value.total > 0 ? Math.round((value.done / value.total) * 100) : 0,
    }));

    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", { month: "short" });
      months.push({ key, label });
    }

    const monthlyDone = new Map<string, number>();
    for (const month of months) {
      monthlyDone.set(month.key, 0);
    }

    for (const task of tasks) {
      if (!task.completedAt) continue;
      const key = `${task.completedAt.getFullYear()}-${String(task.completedAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyDone.has(key)) {
        monthlyDone.set(key, (monthlyDone.get(key) ?? 0) + 1);
      }
    }

    const timeline = months.map((month, index) => ({
      period: month.label,
      planned: Math.round(((index + 1) / months.length) * 100),
      actual: Math.min(100, Math.round((((monthlyDone.get(month.key) ?? 0) / Math.max(1, tasks.length)) * 100) + (index * 2))),
      completedTasks: monthlyDone.get(month.key) ?? 0,
    }));

    return NextResponse.json({
      stageCompletion,
      timeline,
      totals: {
        tasks: tasks.length,
        done: tasks.filter((task) => task.status === "done").length,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
