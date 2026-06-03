import { useStore }     from "../../store/index";
import Dashboard        from "../../pages/Dashboard";
import TaskPage         from "../../pages/TaskPage";
import FocusRoom        from "../../pages/FocusRoom";
import AnalyticsPage    from "../../pages/AnalyticsPage";
import SettingsPage     from "../../pages/SettingsPage";

const ROUTES = {
  dashboard: Dashboard,
  task:      TaskPage,
  focus:     FocusRoom,
  analytics: AnalyticsPage,
  settings:  SettingsPage,
};

export function Router() {
  const { state } = useStore();
  const Page = ROUTES[state.page] ?? Dashboard;
  // keying on the page id remounts the wrapper, replaying the enter animation
  return (
    <div key={state.page} className="page-transition" style={{ flex: 1, minWidth: 0 }}>
      <Page />
    </div>
  );
}
