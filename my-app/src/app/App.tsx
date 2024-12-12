"use client";

import "@mantine/core/styles.css";
import {
  AppShell,
  Burger,
  createTheme,
  Group,
  MantineProvider,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

const theme = createTheme({
  primaryColor: "cyan",
});

function App({ children }: { children: React.ReactNode }) {
  const [navOpened, { toggle: toggleNav }] = useDisclosure();

  return (
    <MantineProvider forceColorScheme="dark" theme={theme}>
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
          <NavLink component={Link} href="/" label="Home" />
          <NavLink component={Link} href="/composer" label="Composer" />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
