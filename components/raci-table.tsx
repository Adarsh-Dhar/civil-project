import { useState, useMemo } from "react";

interface Task {
  id: number;
  stage: string;
  task: string;
  R: string;
  A: string;
  C: string;
  I: string;
  cost: number;
  time: number;
  costWeight: number;
  timeWeight: number;
}

interface StageColors {
  [key: string]: {
    bg: string;
    text: string;
    border: string;
  };
}

interface RaciColors {
  [key: string]: {
    bg: string;
    text: string;
    label: string;
  };
}

interface StageProgress {
  [key: string]: {
    tasks: Task[];
    costDone: number;
    timeDone: number;
    totalCost: number;
    totalTime: number;
  };
}

const TASKS: Task[] = [
  { id: 1, stage: "DPR", task: "Inception report", R: "Consultant", A: "Client", C: "PMC", I: "Govt", cost: 0.08, time: 15, costWeight: 0.003498, timeWeight: 0.010316 },
  { id: 2, stage: "DPR", task: "Feasibility study", R: "Consultant", A: "Client", C: "Survey", I: "PMC", cost: 0.30, time: 30, costWeight: 0.013118, timeWeight: 0.020633 },
  { id: 3, stage: "DPR", task: "Traffic survey", R: "Consultant", A: "Client", C: "Experts", I: "PMC", cost: 0.15, time: 20, costWeight: 0.006559, timeWeight: 0.013755 },
  { id: 4, stage: "DPR", task: "Topographic survey", R: "Survey Team", A: "Consultant", C: "Contractor", I: "Client", cost: 0.20, time: 25, costWeight: 0.008745, timeWeight: 0.017194 },
  { id: 5, stage: "DPR", task: "Geotech investigation", R: "Consultant", A: "Client", C: "Lab", I: "PMC", cost: 0.35, time: 30, costWeight: 0.015304, timeWeight: 0.020633 },
  { id: 6, stage: "DPR", task: "LA Stage I", R: "Consultant", A: "Client", C: "Govt", I: "PMC", cost: 0.10, time: 20, costWeight: 0.004373, timeWeight: 0.013755 },
  { id: 7, stage: "DPR", task: "DPR preparation", R: "Consultant", A: "Client", C: "AE", I: "PMC", cost: 0.80, time: 45, costWeight: 0.034980, timeWeight: 0.030949 },
  { id: 8, stage: "DPR", task: "BOQ prep", R: "Consultant", A: "Client", C: "AE", I: "PMC", cost: 0.12, time: 15, costWeight: 0.005247, timeWeight: 0.010316 },
  { id: 9, stage: "LA", task: "LA-II", R: "Consultant", A: "Client", C: "Govt", I: "PMC", cost: 0.20, time: 30, costWeight: 0.008745, timeWeight: 0.020633 },
  { id: 10, stage: "LA", task: "LA-III", R: "Govt", A: "Client", C: "Consultant", I: "PMC", cost: 2.50, time: 60, costWeight: 0.109314, timeWeight: 0.041265 },
  { id: 11, stage: "LA", task: "LA-IV", R: "Govt", A: "Client", C: "Consultant", I: "Contractor", cost: 1.80, time: 90, costWeight: 0.078706, timeWeight: 0.061898 },
  { id: 12, stage: "Tender", task: "Tender prep", R: "Consultant", A: "Client", C: "PMC", I: "Contractor", cost: 0.10, time: 15, costWeight: 0.004373, timeWeight: 0.010316 },
  { id: 13, stage: "Tender", task: "Tender invite", R: "Client", A: "Client", C: "Consultant", I: "Public", cost: 0.02, time: 10, costWeight: 0.000875, timeWeight: 0.006878 },
  { id: 14, stage: "Tender", task: "Prequalification", R: "Client", A: "Client", C: "Consultant", I: "PMC", cost: 0.03, time: 15, costWeight: 0.001312, timeWeight: 0.010316 },
  { id: 15, stage: "Tender", task: "Technical bid", R: "Client", A: "Client", C: "Consultant", I: "Bidders", cost: 0.02, time: 5, costWeight: 0.000875, timeWeight: 0.003439 },
  { id: 16, stage: "Tender", task: "Financial bid", R: "Client", A: "Client", C: "Consultant", I: "Bidders", cost: 0.02, time: 5, costWeight: 0.000875, timeWeight: 0.003439 },
  { id: 17, stage: "Tender", task: "LOA", R: "Client", A: "Client", C: "Consultant", I: "Contractor", cost: 0.01, time: 7, costWeight: 0.000437, timeWeight: 0.004814 },
  { id: 18, stage: "Pre-Con", task: "AE appointment", R: "Client", A: "Client", C: "Consultant", I: "Contractor", cost: 0.30, time: 15, costWeight: 0.013118, timeWeight: 0.010316 },
  { id: 19, stage: "Pre-Con", task: "Utility shifting", R: "Contractor", A: "Client", C: "Govt", I: "PMC", cost: 1.50, time: 60, costWeight: 0.065588, timeWeight: 0.041265 },
  { id: 20, stage: "Pre-Con", task: "Clearances", R: "Govt", A: "Client", C: "Consultant", I: "PMC", cost: 0.50, time: 90, costWeight: 0.021863, timeWeight: 0.061898 },
  { id: 21, stage: "Pre-Con", task: "Camp setup", R: "Contractor", A: "Contractor", C: "PMC", I: "Client", cost: 2.00, time: 30, costWeight: 0.087451, timeWeight: 0.020633 },
  { id: 22, stage: "Design", task: "Design submission", R: "Contractor", A: "Contractor", C: "Consultant", I: "Client", cost: 0.15, time: 20, costWeight: 0.006559, timeWeight: 0.013755 },
  { id: 23, stage: "Design", task: "Proof checking", R: "Consultant", A: "Client", C: "AE", I: "Contractor", cost: 0.08, time: 15, costWeight: 0.003498, timeWeight: 0.010316 },
  { id: 24, stage: "Design", task: "AE review", R: "AE", A: "Client", C: "Consultant", I: "Contractor", cost: 0.05, time: 10, costWeight: 0.002186, timeWeight: 0.006878 },
  { id: 25, stage: "Design", task: "Approval", R: "Client", A: "Client", C: "AE", I: "Contractor", cost: 0.02, time: 7, costWeight: 0.000875, timeWeight: 0.004814 },
  { id: 26, stage: "Construction", task: "Earthwork", R: "Contractor", A: "Contractor", C: "AE", I: "Client", cost: 1.20, time: 60, costWeight: 0.052470, timeWeight: 0.041265 },
  { id: 27, stage: "Construction", task: "Subgrade", R: "Contractor", A: "Contractor", C: "AE", I: "PMC", cost: 0.80, time: 30, costWeight: 0.034980, timeWeight: 0.020633 },
  { id: 28, stage: "Construction", task: "GSB+WMM", R: "Contractor", A: "Contractor", C: "AE", I: "PMC", cost: 1.00, time: 40, costWeight: 0.043725, timeWeight: 0.027510 },
  { id: 29, stage: "Construction", task: "Pavement", R: "Contractor", A: "Contractor", C: "AE", I: "Client", cost: 3.00, time: 50, costWeight: 0.131176, timeWeight: 0.034388 },
  { id: 30, stage: "Construction", task: "Drainage", R: "Contractor", A: "Contractor", C: "AE", I: "PMC", cost: 0.70, time: 40, costWeight: 0.030608, timeWeight: 0.027510 },
  { id: 31, stage: "Construction", task: "Structures", R: "Contractor", A: "Contractor", C: "AE", I: "Client", cost: 4.00, time: 120, costWeight: 0.174902, timeWeight: 0.082531 },
  { id: 32, stage: "Post", task: "Testing", R: "AE", A: "Client", C: "Consultant", I: "Contractor", cost: 0.20, time: 20, costWeight: 0.008745, timeWeight: 0.013755 },
  { id: 33, stage: "Post", task: "Final billing", R: "Contractor", A: "Client", C: "Consultant", I: "PMC", cost: 0.05, time: 30, costWeight: 0.002186, timeWeight: 0.020633 },
  { id: 34, stage: "Post", task: "Handover", R: "Contractor", A: "Client", C: "AE", I: "Public", cost: 0.02, time: 15, costWeight: 0.000875, timeWeight: 0.010316 },
  { id: 35, stage: "Post", task: "DLP", R: "Contractor", A: "Contractor", C: "Client", I: "PMC", cost: 0.50, time: 365, costWeight: 0.021863, timeWeight: 0.251032 },
];

const STAGE_COLORS: StageColors = {
  DPR: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  LA: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Tender: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "Pre-Con": { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  Design: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Construction: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Post: { bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4" },
};

const RACI_COLORS: RaciColors = {
  R: { bg: "#DBEAFE", text: "#1D4ED8", label: "Responsible" },
  A: { bg: "#EDE9FE", text: "#7C3AED", label: "Accountable" },
  C: { bg: "#FEF3C7", text: "#B45309", label: "Consulted" },
  I: { bg: "#D1FAE5", text: "#065F46", label: "Informed" },
};

export function RACITable() {
  const [completed, setCompleted] = useState(new Set());
  const [alpha, setAlpha] = useState(0.5);
  const [filterStage, setFilterStage] = useState("All");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const beta = 1 - alpha;

  const { totalCostDone, totalTimeDone, overallProgress } = useMemo(() => {
    let costDone = 0, timeDone = 0;
    completed.forEach(id => {
      const t = TASKS.find(x => x.id === id);
      if (t) { costDone += t.costWeight; timeDone += t.timeWeight; }
    });
    return {
      totalCostDone: costDone,
      totalTimeDone: timeDone,
      overallProgress: alpha * costDone + beta * timeDone,
    };
  }, [completed, alpha, beta]);

  const stageProgress: StageProgress = useMemo(() => {
    const stages: StageProgress = {};
    TASKS.forEach(t => {
      if (!stages[t.stage]) stages[t.stage] = { tasks: [], costDone: 0, timeDone: 0, totalCost: 0, totalTime: 0 };
      stages[t.stage].tasks.push(t);
      stages[t.stage].totalCost += t.costWeight;
      stages[t.stage].totalTime += t.timeWeight;
      if (completed.has(t.id)) {
        stages[t.stage].costDone += t.costWeight;
        stages[t.stage].timeDone += t.timeWeight;
      }
    });
    return stages;
  }, [completed]);

  const toggleTask = (id: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stages = Object.keys(STAGE_COLORS);
  const filteredTasks = filterStage === "All" ? TASKS : TASKS.filter(t => t.stage === filterStage);

  const pct = (v: number) => (v * 100).toFixed(1) + "%";

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0", color: "var(--color-text-primary)" }}>
      <h2 className="sr-only">RACI Matrix with weighted progress tracking for construction project</h2>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Overall Progress", value: pct(overallProgress), sub: `α=${alpha.toFixed(1)} · β=${beta.toFixed(1)}`, highlight: true },
          { label: "Cost Progress (α)", value: pct(totalCostDone), sub: `${completed.size} tasks done` },
          { label: "Time Progress (β)", value: pct(totalTimeDone), sub: `Weight contribution` },
          { label: "Tasks Done", value: `${completed.size} / ${TASKS.length}`, sub: "Click rows to toggle" },
        ].map((c, i) => (
          <div key={i} style={{ background: i === 0 ? "#4F46E5" : "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.75)" : "var(--color-text-secondary)", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: i === 0 ? "#fff" : "var(--color-text-primary)" }}>{c.value}</div>
            <div style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.6)" : "var(--color-text-secondary)", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Project Progress = α × Cost Progress + β × Time Progress</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{pct(overallProgress)}</span>
        </div>
        <div style={{ height: 10, background: "var(--color-border-tertiary)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct(overallProgress), background: "linear-gradient(90deg, #4F46E5, #7C3AED)", borderRadius: 6, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
              <span>Cost α = {alpha.toFixed(1)}</span><span>{pct(totalCostDone)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", fontSize: 12, color: "var(--color-text-secondary)", minWidth: 60 }}>
            β = {beta.toFixed(1)}
            <span style={{ fontSize: 10, marginTop: 2 }}>Time</span>
          </div>
        </div>
      </div>

      {/* Stage Progress Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 16 }}>
        {stages.map(s => {
          const sp = stageProgress[s] || {};
          const prog = sp.totalCost > 0 ? (alpha * sp.costDone + beta * sp.timeDone) / (alpha * sp.totalCost + beta * sp.totalTime) : 0;
          const done = (sp.tasks || []).filter((t: Task) => completed.has(t.id)).length;
          const c = STAGE_COLORS[s as keyof typeof STAGE_COLORS];
          return (
            <div key={s} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}
              onClick={() => setFilterStage(filterStage === s ? "All" : s)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{s}</span>
                <span style={{ fontSize: 11, color: c.text }}>{done}/{(sp.tasks || []).length}</span>
              </div>
              <div style={{ height: 5, background: "rgba(0,0,0,0.1)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: (prog * 100).toFixed(1) + "%", background: c.text, borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 10, color: c.text, marginTop: 3, textAlign: "right" }}>{(prog * 100).toFixed(0)}%</div>
            </div>
          );
        })}
      </div>

      {/* RACI Legend + Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(RACI_COLORS).map(([k, v]) => (
            <span key={k} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: v.bg, color: v.text, fontWeight: 500 }}>
              {k} = {v.label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...stages].map(s => (
            <button key={s} onClick={() => setFilterStage(s)} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 6,
              background: filterStage === s ? "#4F46E5" : "var(--color-background-secondary)",
              color: filterStage === s ? "#fff" : "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)", cursor: "pointer"
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* RACI Table */}
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--color-background-secondary)" }}>
                {["#", "Stage", "Task", "R", "A", "C", "I", "Cost (Cr)", "Time (Days)", "Cost Wt", "Time Wt", "Contribution", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 10px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => {
                const done = completed.has(task.id);
                const contrib = (alpha * task.costWeight + beta * task.timeWeight) * 100;
                const sc = STAGE_COLORS[task.stage as keyof typeof STAGE_COLORS];
                const isExpanded = expandedTask === task.id;
                return (
                  <>
                    <tr key={task.id}
                      onClick={() => { toggleTask(task.id); setExpandedTask(isExpanded ? null : task.id); }}
                      style={{
                        cursor: "pointer",
                        background: done ? "rgba(79,70,229,0.06)" : idx % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)",
                        borderBottom: "0.5px solid var(--color-border-tertiary)",
                        transition: "background 0.15s"
                      }}>
                      <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.id}</td>
                      <td style={{ padding: "10px 10px" }}>
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: sc.bg, color: sc.text, fontWeight: 500 }}>{task.stage}</span>
                      </td>
                      <td style={{ padding: "10px 10px", fontWeight: done ? 500 : 400, color: done ? "#4F46E5" : "var(--color-text-primary)", maxWidth: 160, textDecoration: done ? "none" : "none" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: 4, border: done ? "none" : "1.5px solid var(--color-border-secondary)",
                            background: done ? "#4F46E5" : "transparent", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                          </span>
                          {task.task}
                        </span>
                      </td>
                      {(["R", "A", "C", "I"] as const).map(role => {
                        const rc = RACI_COLORS[role];
                        return (
                          <td key={role} style={{ padding: "10px 8px" }}>
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: rc.bg, color: rc.text, whiteSpace: "nowrap", display: "inline-block" }}>{task[role]}</span>
                          </td>
                        );
                      })}
                      <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.cost.toFixed(2)}</td>
                      <td style={{ padding: "10px 10px", color: "var(--color-text-secondary)" }}>{task.time}</td>
                      <td style={{ padding: "10px 10px", color: "#1D4ED8", fontSize: 11 }}>{(task.costWeight * 100).toFixed(2)}%</td>
                      <td style={{ padding: "10px 10px", color: "#7C3AED", fontSize: 11 }}>{(task.timeWeight * 100).toFixed(2)}%</td>
                      <td style={{ padding: "10px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 50, height: 5, background: "var(--color-border-tertiary)", borderRadius: 3 }}>
                            <div style={{ height: "100%", width: Math.min(contrib / 0.5 * 100, 100) + "%", background: done ? "#4F46E5" : "#94A3B8", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{contrib.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 10px" }}>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 500,
                          background: done ? "#D1FAE5" : "var(--color-background-secondary)",
                          color: done ? "#065F46" : "var(--color-text-secondary)"
                        }}>{done ? "Done ✓" : "Pending"}</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${task.id}`}>
                        <td colSpan={13} style={{ background: "#F8F7FF", padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
                            <div>
                              <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>Progress Contribution</div>
                              <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                                <div>Cost weight: <strong>{(task.costWeight * 100).toFixed(3)}%</strong></div>
                                <div>Time weight: <strong>{(task.timeWeight * 100).toFixed(3)}%</strong></div>
                                <div>Contribution (α·Cw + β·Tw): <strong style={{ color: "#4F46E5" }}>{contrib.toFixed(3)}%</strong></div>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>RACI Details</div>
                              {Object.entries(RACI_COLORS).map(([k, v]) => (
                                <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                                  <span style={{ background: v.bg, color: v.text, padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 500, minWidth: 14 }}>{k}</span>
                                  <span style={{ color: "var(--color-text-secondary)" }}>{v.label}: <strong style={{ color: "var(--color-text-primary)" }}>{task[k as keyof Task]}</strong></span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, marginBottom: 6, color: "#4F46E5" }}>Cost & Time</div>
                              <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                                <div>Cost: <strong>₹{task.cost} Cr</strong></div>
                                <div>Duration: <strong>{task.time} days</strong></div>
                                <div>Stage: <strong>{task.stage}</strong></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--color-text-secondary)", textAlign: "center" }}>
        Click any row to mark as complete and update progress · Formula: Progress = α × ΣCostWeight + β × ΣTimeWeight
      </div>
    </div>
  );
}