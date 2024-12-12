"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  rem,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { setOverrideSlot } from "./server/actions";
import Display from "./display";
import { EditSlotsModal } from "./EditSlotsModal";
import { buildMessage } from "./utils";
import { Panel as PanelType } from "./types";
import { IconDotsVertical } from "@tabler/icons-react";
import PanelModes from "./PanelModes";

export default function Panel({
  panel,
  scenes,
}: {
  panel: PanelType;
  scenes: string[];
}) {
  const [editSlotsOpened, editSlotsHandlers] = useDisclosure(false);
  const [modesOpened, modesHandlers] = useDisclosure(false);

  console.log(panel);

  return (
    <>
      <EditSlotsModal
        opened={editSlotsOpened}
        close={editSlotsHandlers.close}
        scheduledSlots={panel.scheduledSlots}
        scenes={scenes}
      />
      <PanelModes
        opened={modesOpened}
        close={modesHandlers.close}
        panel={panel}
      />
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={700}>Winnie&apos;s Room</Text>
            <Group>
              <Button
                variant="light"
                size="compact-sm"
                onClick={() => modesHandlers.open()}
              >
                Change
              </Button>
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
                    onClick={async () => {
                      const hour = new Date().getHours();
                      const minute = new Date().getMinutes();

                      setOverrideSlot({
                        start: { hour, minute },
                        end: { hour: hour + 2, minute },
                        scene: "bunny",
                      });
                    }}
                  >
                    Rename Panel
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() => {
                      setOverrideSlot(null);
                    }}
                  >
                    Reload Schedule
                  </Menu.Item>
                  <Menu.Item onClick={editSlotsHandlers.open}>
                    Edit Schedule
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Card.Section>
        <Card.Section pos="relative">
          <Display
            layers={panel.macros}
            dimensions={{ height: 32, width: 32 }}
            blocky
          />
          <Text
            flex="auto"
            c="white"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "8px 22px",
              background:
                "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(0,212,255,0) 100%);",
            }}
          >
            {buildMessage(panel)}
          </Text>
          <Badge
            color="orange"
            size="md"
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
            }}
          >
            {panel.overrideSlot === null && panel.scheduledSlot
              ? "Scheduled"
              : "Mode"}
          </Badge>
        </Card.Section>
      </Card>
    </>
  );
}
