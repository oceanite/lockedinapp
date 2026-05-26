import { COLORS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { Toggle, Select, SectionLabel, PrimaryButton } from "../components/ui/index";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const { settings } = state;

  const set = (key, value) => dispatch(actions.updateSetting(key, value));
  const toggle = (key) => set(key, !settings[key]);

  return (
    <PageLayout>
      <PageHeader title="Settings" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <SettingsCard title="Pomodoro Settings" sectionLabel="TIMER">
          <SettingRow label="Auto Start Breaks" desc="Automatically start breaks after focus session">
            <Toggle on={settings.autoBreaks} onChange={() => toggle("autoBreaks")} />
          </SettingRow>
          <SettingRow label="Focus Duration">
            <Select value={settings.focusDuration} onChange={v => set("focusDuration", v)}
              options={[
                { value: "15", label: "15 min" }, { value: "25", label: "25 min" },
                { value: "30", label: "30 min" }, { value: "45", label: "45 min" },
              ]}
            />
          </SettingRow>
          <SettingRow label="Short Break">
            <Select value={settings.shortBreak} onChange={v => set("shortBreak", v)}
              options={[{ value: "5", label: "5 min" }, { value: "10", label: "10 min" }]}
            />
          </SettingRow>
          <SettingRow label="Long Break">
            <Select value={settings.longBreak} onChange={v => set("longBreak", v)}
              options={[{ value: "15", label: "15 min" }, { value: "20", label: "20 min" }, { value: "30", label: "30 min" }]}
            />
          </SettingRow>
          <SettingRow label="Long Break Interval" desc="Sessions before long break" last>
            <Select value={settings.breakInterval} onChange={v => set("breakInterval", v)}
              options={[{ value: "2", label: "2 sessions" }, { value: "4", label: "4 sessions" }, { value: "6", label: "6 sessions" }]}
            />
          </SettingRow>
        </SettingsCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SettingsCard title="Focus & Alerts" sectionLabel="NOTIFICATIONS">
            <SettingRow label="Do Not Disturb Mode" desc="Block distractions during focus sessions">
              <Toggle on={settings.dnd} onChange={() => toggle("dnd")} />
            </SettingRow>
            <SettingRow label="Sound Notifications">
              <Toggle on={settings.sound} onChange={() => toggle("sound")} />
            </SettingRow>
            <SettingRow label="Push Notifications" last>
              <Toggle on={settings.notifications} onChange={() => toggle("notifications")} />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="Theme Engine" sectionLabel="APPEARANCE">
            <SettingRow label="Color Theme" last>
              <Select value={settings.theme} onChange={v => set("theme", v)}
                options={[
                  { value: "dark",     label: "Dark (Default)" },
                  { value: "midnight", label: "Midnight" },
                  { value: "ocean",    label: "Ocean" },
                ]}
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="Profile" sectionLabel="ACCOUNT">
            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Display Name</FieldLabel>
              <TextInput value={settings.userName} onChange={v => set("userName", v)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Email</FieldLabel>
              <TextInput value={settings.userEmail} onChange={v => set("userEmail", v)} />
            </div>
            <PrimaryButton style={{ fontSize: 13, padding: "8px 20px", borderRadius: 8 }}>
              Save Changes
            </PrimaryButton>
          </SettingsCard>
        </div>
      </div>
    </PageLayout>
  );
}

function SettingsCard({ title, sectionLabel, children }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 16,
      border: `1px solid ${COLORS.border}`, padding: "20px",
    }}>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, children, last = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0",
      borderBottom: last ? "none" : `1px solid ${COLORS.border}`,
    }}>
      <div>
        <div style={{ color: COLORS.text, fontSize: 14, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ color: COLORS.textSec, fontSize: 12, marginBottom: 6 }}>{children}</div>;
}

function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", boxSizing: "border-box",
        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: "8px 12px",
        color: COLORS.text, fontFamily: "inherit", fontSize: 14, outline: "none",
      }}
    />
  );
}
