import { useState, useMemo } from "react";
import { COLORS, QUADRANTS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { formatDate } from "../utils/helpers";
import { Card, Badge, PrimaryButton } from "../components/ui/index";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

// ── Filter options ──────────────────────────────────────────
const STATUS_FILTERS = [
  { key: "all",     label: "All"       },
  { key: "active",  label: "Active"    },
  { key: "done",    label: "Completed" },
];

const SORT_OPTIONS = [
  { key: "default",  label: "Default"       },
  { key: "deadline", label: "Deadline"       },
  { key: "alpha",    label: "A → Z"          },
];

// ── Helpers ─────────────────────────────────────────────────
function applyFilter(tasks, status, search) {
  return tasks
    .filter(t => {
      if (status === "active") return !t.done;
      if (status === "done")   return  t.done;
      return true;
    })
    .filter(t =>
      search.trim() === "" ||
      t.text.toLowerCase().includes(search.trim().toLowerCase())
    );
}

function applySort(tasks, sort) {
  const copy = [...tasks];
  if (sort === "deadline") {
    return copy.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  if (sort === "alpha") {
    return copy.sort((a, b) => a.text.localeCompare(b.text));
  }
  return copy; // default: insertion order
}

// ── Page ────────────────────────────────────────────────────
export default function TaskPage() {
  const { state, dispatch } = useStore();
  const { tasks } = state;

  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ text: "", quadrant: "doNow", deadline: "" });
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("all");
  const [sort, setSort]         = useState("default");

  const handleAdd = () => {
    if (!form.text.trim()) return;
    dispatch(actions.addTask(form.quadrant, {
      id: Date.now(), text: form.text, done: false, deadline: form.deadline,
    }));
    setForm({ text: "", quadrant: "doNow", deadline: "" });
    setShowAdd(false);
  };

  // Apply filter + sort to every quadrant
  const filteredTasks = useMemo(() => {
    const result = {};
    for (const q of QUADRANTS) {
      result[q.key] = applySort(applyFilter(tasks[q.key], status, search), sort);
    }
    return result;
  }, [tasks, status, search, sort]);

  const totalVisible = QUADRANTS.reduce((s, q) => s + filteredTasks[q.key].length, 0);
  const totalAll     = QUADRANTS.reduce((s, q) => s + tasks[q.key].length, 0);
  const isFiltered   = status !== "all" || search.trim() !== "" || sort !== "default";

  return (
    <PageLayout>
      <PageHeader
        title="Task Manager"
        action={<PrimaryButton onClick={() => setShowAdd(v => !v)}>+ Add Task</PrimaryButton>}
      />

      {/* ── Add form ── */}
      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>New Task</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={form.text}
              onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Task description…"
              style={inputStyle}
            />
            <select
              value={form.quadrant}
              onChange={e => setForm(p => ({ ...p, quadrant: e.target.value }))}
              style={selectStyle}
            >
              {QUADRANTS.map(q => (
                <option key={q.key} value={q.key}>{q.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              style={{ ...inputStyle, flex: "1 1 140px" }}
            />
            <button onClick={handleAdd} style={addBtnStyle}>Add</button>
          </div>
        </Card>
      )}

      {/* ── Filter bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 20, flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: COLORS.textMuted, fontSize: 14, pointerEvents: "none",
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ ...inputStyle, flex: "unset", width: "100%", paddingLeft: 32 }}
          />
        </div>

        {/* Status pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                background: status === f.key ? COLORS.blue : COLORS.card,
                color:      status === f.key ? "#fff"       : COLORS.textSec,
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ ...selectStyle, flex: "0 0 auto", minWidth: 130 }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        {/* Reset filter */}
        {isFiltered && (
          <button
            onClick={() => { setSearch(""); setStatus("all"); setSort("default"); }}
            style={{
              background: "transparent", border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "7px 12px",
              color: COLORS.textMuted, fontFamily: "inherit",
              fontSize: 13, cursor: "pointer",
            }}
          >
            ✕ Reset
          </button>
        )}

        {/* Result count */}
        <span style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: "auto" }}>
          {isFiltered ? `${totalVisible} of ${totalAll}` : `${totalAll}`} tasks
        </span>
      </div>

      {/* ── Quadrant grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {QUADRANTS.map(q => (
          <QuadrantColumn
            key={q.key}
            quadrant={q}
            tasks={filteredTasks[q.key]}
            totalCount={tasks[q.key].length}
            isFiltered={isFiltered}
            onToggle={id => dispatch(actions.toggleTask(q.key, id))}
            onRemove={id => dispatch(actions.removeTask(q.key, id))}
          />
        ))}
      </div>
    </PageLayout>
  );
}

// ── Quadrant column ─────────────────────────────────────────
function QuadrantColumn({ quadrant, tasks, totalCount, isFiltered, onToggle, onRemove }) {
  const { label, desc, color } = quadrant;
  return (
    <Card style={{ border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color, fontWeight: 700, fontSize: 15 }}>{label}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{desc}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Show "X of Y" when filtered */}
          {isFiltered && tasks.length !== totalCount && (
            <span style={{ color: COLORS.textMuted, fontSize: 11 }}>
              {tasks.length}/{totalCount}
            </span>
          )}
          <Badge color={color}>{tasks.length}</Badge>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: "12px 0" }}>
            {isFiltered ? "No matching tasks" : "No tasks here"}
          </div>
        )}
        {tasks.map(t => (
          <TaskRow
            key={t.id} task={t} color={color}
            onToggle={() => onToggle(t.id)}
            onRemove={() => onRemove(t.id)}
          />
        ))}
      </div>
    </Card>
  );
}

// ── Task row ────────────────────────────────────────────────
function TaskRow({ task, color, onToggle, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: COLORS.bg, borderRadius: 8, padding: "10px 12px",
      opacity: task.done ? 0.5 : 1,
      transition: "opacity 0.2s",
    }}>
      <div onClick={onToggle} style={{
        width: 16, height: 16,
        border: `1.5px solid ${task.done ? color : COLORS.textSec}`,
        borderRadius: 4, cursor: "pointer", flexShrink: 0,
        background: task.done ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {task.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
      </div>
      <span style={{
        color: COLORS.text, fontSize: 13, flex: 1,
        textDecoration: task.done ? "line-through" : "none",
      }}>
        {task.text}
      </span>
      {task.deadline && (
        <span style={{
          color: isOverdue(task) ? COLORS.red : COLORS.textMuted,
          fontSize: 10, flexShrink: 0,
        }}>
          {formatDate(task.deadline)}
          {isOverdue(task) && !task.done && " ⚠"}
        </span>
      )}
      <button onClick={onRemove} style={{
        background: "none", border: "none", color: COLORS.textMuted,
        cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

function isOverdue(task) {
  if (!task.deadline || task.done) return false;
  return new Date(task.deadline) < new Date(new Date().toDateString());
}

// ── Shared styles ────────────────────────────────────────────
const inputStyle = {
  flex: "2 1 200px",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8, padding: "8px 12px",
  color: COLORS.text, fontFamily: "inherit",
  fontSize: 14, outline: "none",
};
const selectStyle = {
  flex: "1 1 120px",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8, padding: "8px 12px",
  color: COLORS.text, fontFamily: "inherit", fontSize: 14,
};
const addBtnStyle = {
  background: COLORS.green, color: "#fff", border: "none",
  borderRadius: 8, padding: "8px 20px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
};