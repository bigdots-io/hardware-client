import "@mantine/core/styles.css";
import App from "./App";
import { getPanel, getScenes } from "./server/actions";
import Panel from "./Panel";

export default async function Home() {
  const panel = await getPanel();
  const scenes = await getScenes();

  return (
    <App>
      <Panel panel={panel} scenes={scenes} />
    </App>
  );
}
