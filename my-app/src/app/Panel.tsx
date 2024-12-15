"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Menu,
  Paper,
  rem,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { changeOverrideTime, setActiveSlot } from "./server/actions";
import Display from "./display";
import { EditSlotsModal } from "./EditSlotsModal";
import { formatActiveSlotScene, formatSlotEndingTime } from "./utils";
import { Panel as PanelType } from "./types";
import { IconDotsVertical } from "@tabler/icons-react";

// function toDate({ hour, minute }: { hour: number; minute: number }) {
//   const date = new Date();
//   date.setHours(hour);
//   date.setMinutes(minute);

//   const currentHour = new Date().getHours();

//   // if (hour < currentHour) {
//   //   date.setDate(date.getDate() + 1);
//   // }

//   return date;
// }

// function canDecreaseTime(panel: PanelType): boolean {
//   const { activeSlot, scheduledSlot } = panel;

//   const proposedEnd = {
//     hour: activeSlot.end.hour,
//     minute: activeSlot.end.minute - 5,
//   };

//   if (scheduledSlot) {
//     return (
//       toDate(proposedEnd).getTime() > toDate(scheduledSlot.start).getTime()
//     );
//   }

//   return false;
// }

export default function Panel({
  panel,
  scenes,
}: {
  panel: PanelType;
  scenes: string[];
}) {
  const [editSlotsOpened, editSlotsHandlers] = useDisclosure(false);

  console.log(panel);

  return (
    <>
      {/* <EditSlotsModal
        opened={editSlotsOpened}
        close={editSlotsHandlers.close}
        scheduledSlots={panel.scheduledSlots}
        scenes={scenes}
      /> */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={700}>Winnie&apos;s Room</Text>
            <Group>
              <Menu position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical
                      style={{ width: rem(16), height: rem(16) }}
                    />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={() => {
                      setActiveSlot(null);
                    }}
                  >
                    Clear Scene
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Card.Section>
        <Card.Section>
          <Display
            layers={panel.macros}
            dimensions={{ height: 32, width: 32 }}
            blocky
          />
          <Card withBorder={false}>
            {panel.activeSlot ? (
              <>
                <Flex>
                  <Box>
                    <Stack gap={4}>
                      <Center>
                        <Text>{formatActiveSlotScene(panel.activeSlot)}</Text>
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
                        {formatSlotEndingTime(panel.activeSlot)}
                      </Badge>
                    </Stack>
                  </Box>
                  <Box flex="auto"></Box>
                  <Flex gap="lg">
                    <Stack gap={6}>
                      <Button
                        variant="filled"
                        disabled={panel.activeSlot.scene == "nothing"}
                        onClick={() => {
                          changeOverrideTime(5);
                        }}
                      >
                        +5 min
                      </Button>
                      <Button
                        variant="filled"
                        // disabled={!canDecreaseTime(panel)}
                        onClick={() => {
                          changeOverrideTime(-5);
                        }}
                      >
                        -5 min
                      </Button>
                    </Stack>
                  </Flex>
                </Flex>
              </>
            ) : (
              <Stack>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={async () => {
                    const hour = new Date().getHours();
                    const minute = new Date().getMinutes();

                    setActiveSlot({
                      start: { hour, minute },
                      end: { hour: hour + 2, minute },
                      scene: "bunny",
                    });
                    close();
                  }}
                >
                  Start nap mode
                </Button>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={async () => {
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
                    close();
                  }}
                >
                  Start sleep mode
                </Button>
              </Stack>
            )}
          </Card>
        </Card.Section>
      </Card>
    </>
  );
}
