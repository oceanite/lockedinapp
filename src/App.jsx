import { StoreProvider, useStore } from "./store/index";
import { Sidebar }       from "./components/layout/Sidebar";
import { Router }        from "./components/layout/Router";
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
  // read the updated COLORS on this same pass.
  applyTheme(state.settings.theme);

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      display: "flex",
      transition: "background 0.3s ease",
    }}>
      <Sidebar />
      <Router />
    </div>
  );
}
