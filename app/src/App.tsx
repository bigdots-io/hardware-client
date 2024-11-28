import "@mantine/core/styles.css";
import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Routes, Route } from "react-router";
import { Panel } from "./Panel";
import { Composer } from "./Composer";

// @ts-ignore
export const fetcher = (...args) => fetch(...args).then((res) => res.json());

function App() {
  const [navOpened, { toggle: toggleNav }] = useDisclosure();

  return (
    <MantineProvider forceColorScheme="dark">
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !navOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group align="center" h="100%" px="md">
            <Burger
              opened={navOpened}
              onClick={toggleNav}
              hiddenFrom="sm"
              size="sm"
            />
            <div>Moon Clock</div>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <NavLink href="/" label="Home" />
          <NavLink href="/composer" label="Composer" />
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            <Route index element={<Panel />} />
            <Route path="composer" element={<Composer />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
