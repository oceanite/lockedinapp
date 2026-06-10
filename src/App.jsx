import { StoreProvider, useStore } from "./store/index";
import { Sidebar }       from "./components/layout/Sidebar";
import { Router }        from "./components/layout/Router";
import AuthScreen        from "./pages/AuthScreen";
import { COLORS, applyTheme } from "./constants/theme";

export default function App() {
  return (
    <StoreProvider>
      <ThemedApp />
    </StoreProvider>
  );
}

function ThemedApp() {
  const { state } = useStore();

  // Apply the palette synchronously during render so children below
  // read the updated COLORS on this same pass. Locked themes fall back
  // to dark so a user can't keep a theme they no longer "own".
  const owned = state.unlockedThemes.includes(state.settings.theme);
  applyTheme(owned ? state.settings.theme : "dark");

  // Gate the whole app behind authentication.
  if (!state.auth.currentUser) {
    return <AuthScreen />;
  }

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      display: "flex",
      width: "100%",
      overflowX: "hidden",
      transition: "background 0.3s ease",
    }}>
      <Sidebar />
      <Router />
    </div>
  );
}
