import { StoreProvider } from "./store/index";
import { Sidebar }       from "./components/layout/Sidebar";
import { Router }        from "./components/layout/Router";
import { COLORS }        from "./constants/theme";

export default function App() {
  return (
    <StoreProvider>
      <div style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        display: "flex",
      }}>
        <Sidebar />
        <Router />
      </div>
    </StoreProvider>
  );
}
