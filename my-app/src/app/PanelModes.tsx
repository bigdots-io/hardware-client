"use client";

import { Button, Flex, Group, Modal, Stack, Text } from "@mantine/core";
import { changeOverrideTime, setOverrideSlot } from "./server/actions";
import { Panel } from "./types";
import { IconTrash } from "@tabler/icons-react";

export default function PanelModes({
  opened,
  close,
  panel,
}: {
  opened: boolean;
  close: () => void;
  panel: Panel;
}) {
  return (
    <Modal opened={opened} onClose={close} title="Panel Modes">
      <Stack>
        {panel.overrideSlot ? (
          <Flex gap="lg">
            <Group justify="space-between" grow flex="auto">
              <Button
                variant="filled"
                onClick={() => {
                  changeOverrideTime(5);
                }}
              >
                +5 min
              </Button>
              <Button
                variant="filled"
                onClick={() => {
                  changeOverrideTime(-5);
                }}
              >
                -5 min
              </Button>
            </Group>
            <Button
              variant="light"
              color="red"
              onClick={() => {
                setOverrideSlot(null);
              }}
            >
              <IconTrash />
            </Button>
          </Flex>
        ) : (
          <Text>No Mode set</Text>
        )}
        {panel.overrideSlot === null && panel.scheduledSlot && (
          <Button
            variant="filled"
            fullWidth
            onClick={async () => {
              const hour = new Date().getHours();
              const minute = new Date().getMinutes();

              setOverrideSlot({
                start: { hour, minute },
                end: { hour: hour + 2, minute },
                scene: "bunny",
              });
              close();
            }}
          >
            Adjust {panel.scheduledSlot.scene} Time
          </Button>
        )}
        <Button
          variant="filled"
          fullWidth
          onClick={async () => {
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();

            setOverrideSlot({
              start: { hour, minute },
              end: { hour: hour + 2, minute },
              scene: "bunny",
            });
            close();
          }}
        >
          Start nap mode
        </Button>
        <Text>CUSTOM, TODO</Text>
      </Stack>
    </Modal>
  );
}
