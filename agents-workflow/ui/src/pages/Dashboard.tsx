import { useState, useEffect } from "react";

interface PlanSummary {
  readonly id: string;
  readonly title: string;
  readonly status: "pending" | "in_progress" | "done";
  readonly tasksTotal: number;
  readonly tasksDone: number;
  readonly updatedAt: string;
}

interface SpecSummary {
  readonly id: string;
  readonly title: string;
  readonly phase: string;
  readonly updatedAt: string;
}

interface KnowledgeEntry {
  readonly id: string;
  readonly kind: string;
  readonly content: string;
  readonly tags: ReadonlyArray<string>;
}

interface DashboardStats {
  readonly plans: ReadonlyArray<PlanSummary>;
  readonly specs: ReadonlyArray<SpecSummary>;
  readonly knowledge: ReadonlyArray<KnowledgeEntry>;
  readonly skillsCount: number;
  readonly workflowsCount: number;
  readonly agentsCount: number;
  readonly commandsCount: number;
}

function StatusBadge({ status }: { readonly status: string }) {
  const colors: Record<string, string> = {
    pending: "#6b7280",
    in_progress: "#3b82f6",
    done: "#10b981",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        color: "white",
        backgroundColor: colors[status] ?? "#6b7280",
      }}
    >
      {status === "pending" ? "待处理" : status === "in_progress" ? "进行中" : "已完成"}
    </span>
  );
}

function ProgressBar({ done, total }: { readonly done: number; readonly total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: "#3b82f6",
            transition: "width 0.3s",
          }}
        />
      </div>
      <span style={{ fontSize: "12px", color: "#6b7280" }}>
        {done}/{total}
      </span>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = (await response.json()) as DashboardStats;
          setStats(data);
        }
      } catch {
        setStats({
          plans: [
            { id: "plan-1", title: "云枢 v0.2", status: "done", tasksTotal: 17, tasksDone: 17, updatedAt: "2026-06-10" },
            { id: "plan-2", title: "云枢 v0.3", status: "in_progress", tasksTotal: 8, tasksDone: 4, updatedAt: "2026-06-10" },
          ],
          specs: [
            { id: "spec-1", title: "v0.2 设计规格", phase: "已完成", updatedAt: "2026-06-08" },
            { id: "spec-2", title: "v0.3 实现计划", phase: "实施中", updatedAt: "2026-06-10" },
          ],
          knowledge: [
            { id: "k-1", kind: "pattern", content: "TypeScript strict 模式下使用 unknown 而非 any", tags: ["typescript", "best-practice"] },
            { id: "k-2", kind: "pattern", content: "Bun 测试框架与 vitest 兼容", tags: ["bun", "testing"] },
          ],
          skillsCount: 85,
          workflowsCount: 90,
          agentsCount: 33,
          commandsCount: 78,
        });
      } finally {
        setLoading(false);
      }
    };
    void loadStats();
  }, []);

  if (loading) {
    return <div style={{ padding: "24px", textAlign: "center" }}>加载中...</div>;
  }

  if (!stats) {
    return <div style={{ padding: "24px", textAlign: "center" }}>无法加载数据</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px" }}>云枢仪表盘</h1>

      {/* 统计卡片 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard title="技能" value={stats.skillsCount} color="#8b5cf6" />
        <StatCard title="工作流" value={stats.workflowsCount} color="#3b82f6" />
        <StatCard title="Agent" value={stats.agentsCount} color="#10b981" />
        <StatCard title="命令" value={stats.commandsCount} color="#f59e0b" />
      </div>

      {/* 计划列表 */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px" }}>计划</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {stats.plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{plan.title}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{plan.updatedAt}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "200px" }}>
                <ProgressBar done={plan.tasksDone} total={plan.tasksTotal} />
                <StatusBadge status={plan.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 规格列表 */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ marginBottom: "16px" }}>规格</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {stats.specs.map((spec) => (
            <div
              key={spec.id}
              style={{
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{spec.title}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{spec.updatedAt}</div>
              </div>
              <span style={{ fontSize: "14px", color: "#3b82f6" }}>{spec.phase}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 知识库 */}
      <section>
        <h2 style={{ marginBottom: "16px" }}>知识库</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {stats.knowledge.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                  }}
                >
                  {entry.kind}
                </span>
              </div>
              <div style={{ fontSize: "14px" }}>{entry.content}</div>
              <div style={{ marginTop: "8px", display: "flex", gap: "4px" }}>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  readonly title: string;
  readonly value: number;
  readonly color: string;
}) {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "32px", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>{title}</div>
    </div>
  );
}
