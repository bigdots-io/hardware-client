import { useEffect, useState } from "react";
import Display from "./display";
import "@mantine/core/styles.css";
import useSWR from "swr";

import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Card,
  Flex,
  Group,
  MantineProvider,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function Color({
  color,
  setActiveColor,
  activeColor,
}: {
  color: string | null;
  setActiveColor: (color: string | null) => void;
  activeColor: string | null;
}) {
  return (
    <>
      <div
        style={{
          width: "20px",
          height: "20px",
          background: color || "#000",
          border: color === activeColor ? "2px solid red" : "none",
        }}
        onClick={() => setActiveColor(color)}
      ></div>
    </>
  );
}
function Palette({
  activeColor,
  setActiveColor,
  matrix,
}: {
  activeColor: string | null;
  setActiveColor: any;
  matrix: any;
}) {
  const [colors, setColors] = useState([
    null,
    "#800080",
    "#f4d0a9",
    "#facc0d",
    "#ffffff",
  ]);

  useEffect(() => {
    const matrixColors = new Set<string>();

    for (const coordinate in matrix) {
      matrixColors.add(matrix[coordinate]);
    }
    setColors([...colors, ...matrixColors]);
  }, []);
  return (
    <div style={{ display: "flex", width: "100%" }}>
      {colors.map((color) => (
        <Color
          color={color}
          setActiveColor={setActiveColor}
          activeColor={activeColor}
        />
      ))}
      <form
        onSubmit={(ev: any) => {
          ev.preventDefault();
          setColors([...colors, ev.target.elements.new_color.value]);
        }}
      >
        <input type="color" name="new_color" />
        <input type="submit" value="add"></input>
      </form>
    </div>
  );
}

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function App() {
  const [activeColor, setActiveColor] = useState(null);
  const [matrix, setMatrix] = useState({});
  const [imageSrc, setImageSrc] = useState("/api/preview");

  const { data: activeSlot, mutate } = useSWR("api/active_slot", fetcher);

  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group align="center" h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <div>Moon Clock</div>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <NavLink href="#required-for-focus" label="Home" />
          <NavLink href="#required-for-focus" label="Composer" />
        </AppShell.Navbar>

        <AppShell.Main>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <img
                src={imageSrc}
                style={{
                  imageRendering: "pixelated",
                  width: "100%",
                }}
              />
            </Card.Section>

            <Stack align="flex-start" gap="xs">
              <Title order={3}>
                Currently showing {activeSlot?.slot?.name}
              </Title>
              <>{activeSlot?.message}</>

              {!activeSlot?.isOverride && (
                <Button
                  fullWidth
                  onClick={async () => {
                    await fetch("/api/nap", { method: "POST" });
                    mutate();
                    setImageSrc("/api/preview?t=" + new Date().getTime());
                  }}
                >
                  Start Nap Mode
                </Button>
              )}
            </Stack>

            {activeSlot?.isOverride && (
              <Stack gap="lg" pt={16}>
                <Group justify="space-between" grow>
                  <Button
                    variant="light"
                    onClick={async () => {
                      await fetch("/api/change_override_time?min=5", {
                        method: "POST",
                      });
                      mutate();
                      setImageSrc("/api/preview?t=" + new Date().getTime());
                    }}
                  >
                    +5 minutes
                  </Button>
                  <Button
                    variant="light"
                    onClick={async () => {
                      await fetch("/api/change_override_time?min=-5", {
                        method: "POST",
                      });
                      mutate();
                      setImageSrc("/api/preview?t=" + new Date().getTime());
                    }}
                  >
                    -5 minutes
                  </Button>
                </Group>
                <Button
                  variant="outline"
                  color="red"
                  onClick={async () => {
                    await fetch("/api/clear_override", { method: "POST" });
                    mutate();
                    setImageSrc("/api/preview?t=" + new Date().getTime());
                  }}
                >
                  Clear
                </Button>
              </Stack>
            )}
          </Card>

          <br />
          <div style={{ display: "none" }}>
            <div style={{ display: "flex" }}>
              <Palette
                activeColor={activeColor}
                setActiveColor={setActiveColor}
                matrix={matrix}
              />
              <button
                onClick={() => console.log(JSON.stringify(matrix, null, "  "))}
              >
                Save
              </button>
            </div>
            <Display
              activeColor={activeColor}
              matrix={matrix}
              setMatrix={setMatrix}
            ></Display>
          </div>
        </AppShell.Main>
      </AppShell>
      <img src="/api/preview" />
    </MantineProvider>
  );
}

export default App;
