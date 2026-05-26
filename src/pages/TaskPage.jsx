import { useState } from "react";
import { COLORS, QUADRANTS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { formatDate } from "../utils/helpers";
import { Card, Badge, PrimaryButton } from "../components/ui/index";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

export default function TaskPage() {
  const { state, dispatch } = useStore();
  const { tasks } = state;

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text: "", quadrant: "doNow", deadline: "" });

  const handleAdd = () => {
    if (!form.text.trim()) return;
    dispatch(actions.addTask(form.quadrant, {
      id: Date.now(), text: form.text, done: false, deadline: form.deadline,
    }));
    setForm({ text: "", quadrant: "doNow", deadline: "" });
    setShowAdd(false);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Task Manager"
        action={
          <PrimaryButton onClick={() => setShowAdd(v => !v)}>+ Add Task</PrimaryButton>
        }
      />

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {QUADRANTS.map(q => (
          <QuadrantColumn
            key={q.key}
            quadrant={q}
            tasks={tasks[q.key]}
            onToggle={id => dispatch(actions.toggleTask(q.key, id))}
            onRemove={id => dispatch(actions.removeTask(q.key, id))}
          />
        ))}
      </div>
    </PageLayout>
  );
}

function QuadrantColumn({ quadrant, tasks, onToggle, onRemove }) {
  const { label, desc, color } = quadrant;
  return (
    <Card style={{ border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color, fontWeight: 700, fontSize: 15 }}>{label}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{desc}</div>
        </div>
        <Badge color={color}>{tasks.length}</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: "12px 0" }}>
            No tasks here
          </div>
        )}
        {tasks.map(t => (
          <TaskRow key={t.id} task={t} color={color}
            onToggle={() => onToggle(t.id)} onRemove={() => onRemove(t.id)} />
        ))}
      </div>
    </Card>
  );
}

function TaskRow({ task, color, onToggle, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: COLORS.bg, borderRadius: 8, padding: "10px 12px",
      opacity: task.done ? 0.5 : 1,
    }}>
      <div onClick={onToggle} style={{
        width: 16, height: 16, border: `1.5px solid ${task.done ? color : COLORS.textSec}`,
        borderRadius: 4, cursor: "pointer", flexShrink: 0,
        background: task.done ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
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
        <span style={{ color: COLORS.textMuted, fontSize: 10 }}>
          {formatDate(task.deadline)}
        </span>
      )}
      <button onClick={onRemove} style={{
        background: "none", border: "none", color: COLORS.textMuted,
        cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

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
