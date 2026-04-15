"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

type ProjectOption = {
  id: string;
  name: string;
};

type ProjectTask = {
  id: string;
  sequence: number;
  stage: string;
  name: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  status: "pending" | "in_progress" | "blocked" | "done";
  costCr: number;
  timeDays: number;
  costWeight: number;
  timeWeight: number;
  _count?: { proofs: number };
};

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DPR: { bg: "rgba(99,102,241,0.15)", text: "#4338CA", border: "rgba(99,102,241,0.35)" },
  LA: { bg: "rgba(245,158,11,0.18)", text: "#B45309", border: "rgba(245,158,11,0.35)" },
  Tender: { bg: "rgba(16,185,129,0.16)", text: "#047857", border: "rgba(16,185,129,0.34)" },
  "Pre-Con": { bg: "rgba(168,85,247,0.16)", text: "#7E22CE", border: "rgba(168,85,247,0.34)" },
  Design: { bg: "rgba(59,130,246,0.16)", text: "#1D4ED8", border: "rgba(59,130,246,0.34)" },
  Construction: { bg: "rgba(244,63,94,0.16)", text: "#BE123C", border: "rgba(244,63,94,0.34)" },
  Post: { bg: "rgba(20,184,166,0.16)", text: "#0F766E", border: "rgba(20,184,166,0.34)" },
};

const RACI_COLORS: Record<"R" | "A" | "C" | "I", { bg: string; text: string; label: string }> = {
  R: { bg: "#DBEAFE", text: "#1D4ED8", label: "Responsible" },
  A: { bg: "#EDE9FE", text: "#7C3AED", label: "Accountable" },
  C: { bg: "#FEF3C7", text: "#B45309", label: "Consulted" },
  I: { bg: "#D1FAE5", text: "#065F46", label: "Informed" },
};

const STATUS_META: Record<ProjectTask["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "#F3F4F6", text: "#374151", label: "Pending" },
  in_progress: { bg: "#DBEAFE", text: "#1D4ED8", label: "In Progress" },
  blocked: { bg: "#FEE2E2", text: "#B91C1C", label: "Blocked" },
  done: { bg: "#D1FAE5", text: "#065F46", label: "Done" },
};

export function RACITable({ projectId: explicitProjectId }: { projectId?: string }) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState(explicitProjectId ?? "");
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [alpha, setAlpha] = useState(0.5);
  const [filterStage, setFilterStage] = useState("All");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const beta = 1 - alpha;

  useEffect(() => {
    if (explicitProjectId) {
      setProjectId(explicitProjectId);
      return;
    }

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) return;
        const data = await response.json();
        const options = (data.projects ?? []).map((p: any) => ({ id: p.id, name: p.name }));
        setProjects(options);
        if (options.length > 0) {
          setProjectId((prev) => prev || options[0].id);
        }
      } catch (error) {
        console.error("Failed to load project list for RACI table", error);
      }
    };

    loadProjects();
  }, [explicitProjectId]);

  useEffect(() => {
    if (!projectId) return;

    const storageKey = `raci-view-${projectId}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { alpha?: number; filterStage?: string; expandedTaskId?: string | null };
      if (typeof parsed.alpha === "number" && parsed.alpha >= 0 && parsed.alpha <= 1) {
        setAlpha(parsed.alpha);
      }
      if (typeof parsed.filterStage === "string") {
        setFilterStage(parsed.filterStage);
      }
      if (typeof parsed.expandedTaskId === "string" || parsed.expandedTaskId === null) {
        setExpandedTaskId(parsed.expandedTaskId ?? null);
      }
    } catch {
      // Ignore malformed storage payload.
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const storageKey = `raci-view-${projectId}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        alpha,
        filterStage,
        expandedTaskId,
      })
    );
  }, [projectId, alpha, filterStage, expandedTaskId]);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    void loadTasks(projectId);
  }, [projectId]);

  const loadTasks = async (activeProjectId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${activeProjectId}/tasks`);
      if (!response.ok) {
        setTasks([]);
        return;
      }

      const data = await response.json();
      setTasks(data.tasks ?? []);
    } catch (error) {
      console.error("Failed to load RACI tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTaskIds = useMemo(() => {
    return new Set(tasks.filter((task) => task.status === "done").map((task) => task.id));
  }, [tasks]);

  const stageProgress = useMemo(() => {
    const result: Record<string, { tasks: ProjectTask[]; totalCost: number; totalTime: number; doneCost: number; doneTime: number }> = {};

    for (const task of tasks) {
      if (!result[task.stage]) {
        result[task.stage] = {
          tasks: [],
          totalCost: 0,
          totalTime: 0,
          doneCost: 0,
          doneTime: 0,
        };
      }

      result[task.stage].tasks.push(task);
      result[task.stage].totalCost += task.costWeight;
      result[task.stage].totalTime += task.timeWeight;

      if (task.status === "done") {
        result[task.stage].doneCost += task.costWeight;
        result[task.stage].doneTime += task.timeWeight;
      }
    }

    return result;
  }, [tasks]);

  const totals = useMemo(() => {
    let totalCostDone = 0;
    let totalTimeDone = 0;

    for (const task of tasks) {
      if (task.status === "done") {
        totalCostDone += task.costWeight;
        totalTimeDone += task.timeWeight;
      }
    }

    return {
      totalCostDone,
      totalTimeDone,
      overallProgress: alpha * totalCostDone + beta * totalTimeDone,
    };
  }, [tasks, alpha, beta]);

  const filteredTasks = useMemo(() => {
    return filterStage === "All" ? tasks : tasks.filter((task) => task.stage === filterStage);
  }, [tasks, filterStage]);

  const stages = useMemo(() => Object.keys(STAGE_COLORS), []);

  const updateTaskStatus = async (taskId: string, status: ProjectTask["status"]) => {
    if (!projectId) return;

    try {
      setUpdatingTaskId(taskId);
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) return;

      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    } catch (error) {
      console.error("Failed to update task status", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading RACI tasks...</div>;
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0", color: "var(--color-text-primary)" }}>
      {!explicitProjectId && projects.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{
              fontSize: 12,
              border: "1px solid var(--color-border-secondary)",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No tasks found for this project.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Overall Progress", value: pct(totals.overallProgress), sub: `α=${alpha.toFixed(1)} · β=${beta.toFixed(1)}`, highlight: true },
              { label: "Cost Progress (α)", value: pct(totals.totalCostDone), sub: `${completedTaskIds.size} tasks done` },
              { label: "Time Progress (β)", value: pct(totals.totalTimeDone), sub: "Weight contribution" },
              { label: "Tasks Done", value: `${completedTaskIds.size} / ${tasks.length}`, sub: "Click rows to toggle" },
            ].map((card, index) => (
              <div
                key={card.label}
                style={{
                  background: index === 0 ? "#4F46E5" : "var(--color-background-secondary)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 11, color: index === 0 ? "rgba(255,255,255,0.75)" : "var(--color-text-secondary)", marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: index === 0 ? "var(--primary-foreground)" : "var(--color-text-primary)" }}>{card.value}</div>
                <div style={{ fontSize: 11, color: index === 0 ? "rgba(255,255,255,0.6)" : "var(--color-text-secondary)", marginTop: 2 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Project Progress = α × Cost Progress + β × Time Progress</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{pct(totals.overallProgress)}</span>
            </div>
            <div style={{ height: 10, background: "var(--color-border-tertiary)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pct(totals.overallProgress), background: "linear-gradient(90deg, #4F46E5, #7C3AED)", borderRadius: 6, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
                  <span>Cost α = {alpha.toFixed(1)}</span>
                  <span>{pct(totals.totalCostDone)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>
                β = {beta.toFixed(1)}
                <span style={{ fontSize: 10, marginTop: 2 }}>Time</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 16 }}>
            {stages.map((stage) => {
              const progress = stageProgress[stage] ?? { tasks: [], totalCost: 0, totalTime: 0, doneCost: 0, doneTime: 0 };
              const denominator = alpha * progress.totalCost + beta * progress.totalTime;
              const stageOverall = denominator > 0 ? (alpha * progress.doneCost + beta * progress.doneTime) / denominator : 0;
              const done = progress.tasks.filter((task) => task.status === "done").length;
              const color = STAGE_COLORS[stage];

              return (
                <div key={stage} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }} onClick={() => setFilterStage((prev) => (prev === stage ? "All" : stage))}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: color.text }}>{stage}</span>
                    <span style={{ fontSize: 11, color: color.text }}>{done}/{progress.tasks.length}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(0,0,0,0.1)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${(stageOverall * 100).toFixed(1)}%`, background: color.text, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(RACI_COLORS).map(([key, value]) => (
                <span key={key} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: value.bg, color: value.text, fontWeight: 500 }}>
                  {key} = {value.label}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...stages].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: filterStage === stage ? "#4F46E5" : "var(--color-background-secondary)",
                    color: filterStage === stage ? "var(--primary-foreground)" : "var(--color-text-secondary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary)" }}>
                    {["#", "Stage", "Task", "R", "A", "C", "I", "Cost (Cr)", "Time (Days)", "Cost Wt", "Time Wt", "Contribution", "Status", "Proofs"].map((heading) => (
                      <th key={heading} style={{ padding: "10px 10px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => {
                    const done = completedTaskIds.has(task.id);
                    const contribution = (alpha * task.costWeight + beta * task.timeWeight) * 100;
                    const stageColor = STAGE_COLORS[task.stage] ?? STAGE_COLORS.DPR;
                    const isExpanded = expandedTaskId === task.id;

                    return (
                      <Fragment key={task.id}>
                        <tr
                          onClick={() => {
                            setExpandedTaskId((prev) => (prev === task.id ? null : task.id));
                          }}
                          style={{
                            cursor: updatingTaskId === task.id ? "wait" : "pointer",
                            background: done ? "rgba(79,70,229,0.06)" : index % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)",
                            borderBottom: "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.sequence}</td>
                          <td style={{ padding: "10px 10px" }}>
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: stageColor.bg, color: stageColor.text, fontWeight: 500 }}>{task.stage}</span>
                          </td>
                          <td style={{ padding: "10px 10px", fontWeight: done ? 500 : 400, color: done ? "#4F46E5" : "var(--color-text-primary)", maxWidth: 220 }}>{task.name}</td>
                          <td style={{ padding: "10px 8px" }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: RACI_COLORS.R.bg, color: RACI_COLORS.R.text }}>{task.responsible}</span></td>
                          <td style={{ padding: "10px 8px" }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: RACI_COLORS.A.bg, color: RACI_COLORS.A.text }}>{task.accountable}</span></td>
                          <td style={{ padding: "10px 8px" }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: RACI_COLORS.C.bg, color: RACI_COLORS.C.text }}>{task.consulted}</span></td>
                          <td style={{ padding: "10px 8px" }}><span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: RACI_COLORS.I.bg, color: RACI_COLORS.I.text }}>{task.informed}</span></td>
                          <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.costCr.toFixed(2)}</td>
                          <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.timeDays}</td>
                          <td style={{ padding: "10px 10px", color: "#1D4ED8", fontSize: 11 }}>{(task.costWeight * 100).toFixed(2)}%</td>
                          <td style={{ padding: "10px 10px", color: "#7C3AED", fontSize: 11 }}>{(task.timeWeight * 100).toFixed(2)}%</td>
                          <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)", fontSize: 11 }}>{contribution.toFixed(2)}%</td>
                          <td style={{ padding: "10px 10px" }}>
                            <select
                              value={task.status}
                              onChange={(event) => {
                                event.stopPropagation();
                                void updateTaskStatus(task.id, event.target.value as ProjectTask["status"]);
                              }}
                              style={{
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 10,
                                border: "1px solid transparent",
                                background: STATUS_META[task.status].bg,
                                color: STATUS_META[task.status].text,
                                fontWeight: 600,
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="blocked">Blocked</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task._count?.proofs ?? 0}</td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={14} style={{ background: "var(--color-background-secondary)", padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, fontSize: 12 }}>
                                <div>
                                  <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>Progress Contribution</div>
                                  <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                                    <div>Cost weight: <strong>{(task.costWeight * 100).toFixed(3)}%</strong></div>
                                    <div>Time weight: <strong>{(task.timeWeight * 100).toFixed(3)}%</strong></div>
                                    <div>Contribution (α·Cw + β·Tw): <strong style={{ color: "#4F46E5" }}>{contribution.toFixed(3)}%</strong></div>
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>RACI Details</div>
                                  <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                                    <div>R: <strong>{task.responsible}</strong></div>
                                    <div>A: <strong>{task.accountable}</strong></div>
                                    <div>C: <strong>{task.consulted}</strong></div>
                                    <div>I: <strong>{task.informed}</strong></div>
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>Cost & Time</div>
                                  <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                                    <div>Cost: <strong>₹{task.costCr.toFixed(2)} Cr</strong></div>
                                    <div>Duration: <strong>{task.timeDays} days</strong></div>
                                    <div>Proofs: <strong>{task._count?.proofs ?? 0}</strong></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: "var(--color-text-secondary)", textAlign: "center" }}>
            Click any row to expand details · Use the status dropdown to set pending, in progress, blocked, or done.
          </div>
        </>
      )}
    </div>
  );
}
