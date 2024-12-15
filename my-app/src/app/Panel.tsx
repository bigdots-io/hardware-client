"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { changeEndTime, setActiveSlot } from "./server/actions";
import Display from "./display";
import { formattedEndingTime } from "./utils";
import { Panel as PanelType } from "./types";

export default function Panel({
  panel,
}: {
  panel: PanelType;
  scenes: string[];
}) {
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={700}>Winnie&apos;s Room</Text>
            {panel.activeSlot && (
              <Button
                variant="light"
                color="red"
                size="compact-sm"
                onClick={() => {
                  setActiveSlot(null);
                }}
              >
                Clear
              </Button>
            )}
          </Group>
        </Card.Section>
        <Card.Section>
          <div style={{ position: "relative" }}>
            <Display
              layers={panel.macros}
              dimensions={{ height: 32, width: 32 }}
              blocky
            />
            {!panel.activeSlot && (
              <Stack
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Button
                  variant="filled"
                  fullWidth
                  onClick={() => {
                    const hour = new Date().getHours();
                    const minute = new Date().getMinutes();

                    setActiveSlot({
                      start: { hour, minute },
                      end: { hour: hour + 2, minute },
                      scene: "bunny",
                    });
                  }}
                >
                  Nap Mode
                </Button>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={() => {
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 1);
                    endDate.setHours(7, 0, 0, 0);

                    const hour = new Date().getHours();
                    const minute = new Date().getMinutes();

                    setActiveSlot({
                      start: { hour, minute },
                      end: {
                        hour: endDate.getHours(),
                        minute: endDate.getMinutes(),
                      },
                      scene: "moon",
                    });
                  }}
                >
                  Sleep Mode
                </Button>
                <Button
                  variant="light"
                  fullWidth
                  onClick={() => {
                    alert("todo");
                  }}
                >
                  Custom...
                </Button>
              </Stack>
            )}
          </div>

          {panel.activeSlot && (
            <Flex p="lg">
              <Box>
                <Stack gap={4}>
                  <Center>
                    <Text>Showing {panel.activeSlot.scene} until...</Text>
                  </Center>
                  <Badge
                    color="gray"
                    radius="sm"
                    style={{
                      height: 50,
                      padding: "8px 16px",
                      fontSize: 38,
                      lineHeight: 38,
                    }}
                  >
                    {formattedEndingTime(panel.activeSlot)}
                  </Badge>
                </Stack>
              </Box>
              <Box flex="auto"></Box>
              <Flex gap="lg">
                <Stack gap={8}>
                  <Button variant="filled" onClick={() => changeEndTime(5)}>
                    +5 min
                  </Button>
                  <Button variant="filled" onClick={() => changeEndTime(-5)}>
                    -5 min
                  </Button>
                </Stack>
              </Flex>
            </Flex>
          )}
        </Card.Section>
      </Card>
    </>
  );
}
