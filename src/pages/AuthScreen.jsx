import { useState } from "react";
import { COLORS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import lockedInLogo from "../assets/lockedin-logo.png";

// Prototype auth — credentials live in localStorage (no backend/hashing).
export default function AuthScreen() {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(""); };

  const users = state.auth.users;

  const submit = (e) => {
    e?.preventDefault?.();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (mode === "register") {
      const name = form.name.trim();
      if (!name) return setError("Please enter your name");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Enter a valid email");
      if (password.length < 4) return setError("Password must be at least 4 characters");
      if (users.some(u => u.email.toLowerCase() === email)) return setError("That email is already registered");
      dispatch(actions.register({ name, email, password }));
      return;
    }

    // login — match by email OR username (admin)
    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) return setError("No account with that email/username. Try registering.");
    if (user.password !== password) return setError("Incorrect password");
    dispatch(actions.login({ name: user.name, email: user.email }));
  };

  const switchMode = (m) => { setMode(m); setError(""); };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, boxSizing: "border-box",
      background: COLORS.bg,
    }}>
      <div style={{
        width: 380, maxWidth: "100%",
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
      }}>
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            overflow: "hidden", background: "#fff", flexShrink: 0,
            border: `1px solid ${COLORS.border}`,
          }}>
            <img src={lockedInLogo} alt="LockedIn"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div>
            <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>LockedIn</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Focus OS</div>
          </div>
        </div>

        {/* tabs */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 20,
          background: COLORS.bg, borderRadius: 12, padding: 4,
        }}>
          {[["login", "Sign In"], ["register", "Register"]].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, border: "none", cursor: "pointer",
              borderRadius: 9, padding: "9px 0",
              fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              background: mode === m ? COLORS.blue : "transparent",
              color: mode === m ? "#fff" : COLORS.textSec,
              transition: "background 0.15s",
            }}>{label}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <Field label="Name">
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Your name" style={inputStyle()} />
            </Field>
          )}
          <Field label={mode === "login" ? "Email or username" : "Email"}>
            <input type="text" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder={mode === "login" ? "you@email.com or admin" : "you@email.com"}
              style={inputStyle()} autoComplete="username" />
          </Field>
          <Field label="Password">
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
              placeholder="••••••" style={inputStyle()}
              autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </Field>

          {error && (
            <div style={{
              color: COLORS.red, fontSize: 12, fontWeight: 600,
              background: `${COLORS.red}14`, border: `1px solid ${COLORS.red}44`,
              borderRadius: 8, padding: "8px 10px",
            }}>{error}</div>
          )}

          <button type="submit" style={{
            marginTop: 4, background: COLORS.blue, color: "#fff", border: "none",
            borderRadius: 12, padding: "12px 0",
            fontFamily: "inherit", fontWeight: 800, fontSize: 15, cursor: "pointer",
          }}>{mode === "login" ? "Sign In" : "Create Account"}</button>
        </form>

        <div style={{ color: COLORS.textMuted, fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          {mode === "login"
            ? <>New here? <Link onClick={() => switchMode("register")}>Create an account</Link></>
            : <>Already have an account? <Link onClick={() => switchMode("login")}>Sign in</Link></>}
        </div>

        {mode === "login" && (
          <div style={{
            marginTop: 12, textAlign: "center",
            color: COLORS.textMuted, fontSize: 11,
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, padding: "8px 10px",
          }}>
            Demo login: username <strong style={{ color: COLORS.text }}>admin</strong>
            {" "}· password <strong style={{ color: COLORS.text }}>admin</strong>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ color: COLORS.textSec, fontSize: 12, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function Link({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", padding: 0, cursor: "pointer",
      color: COLORS.accent, fontFamily: "inherit", fontSize: 11, fontWeight: 700,
    }}>{children}</button>
  );
}

function inputStyle() {
  return {
    width: "100%", boxSizing: "border-box",
    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: "10px 12px",
    color: COLORS.text, fontFamily: "inherit", fontSize: 14, outline: "none",
  };
}
