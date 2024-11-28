import { useState } from "react";
import useSWR from "swr";
import { Button, Card, Group, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { EditSlotsModal } from "./EditSlotsModal";
import { fetcher } from "./App";

export function Panel() {
  const [imageSrc, setImageSrc] = useState("/api/preview");
  const { data: activeSlot, mutate } = useSWR("api/active_slot", fetcher);
  const [editSlotsOpened, editSlotsHandlers] = useDisclosure(false);

  return (
    <>
      <EditSlotsModal
        opened={editSlotsOpened}
        close={editSlotsHandlers.close}
        onSave={() => {
          mutate();
          setImageSrc("/api/preview?t=" + new Date().getTime());
        }}
      />
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
        <Stack align="flex-start" gap="xs" pt={8}>
          <Title order={3}>Currently showing {activeSlot?.slot?.scene}</Title>
          <>{activeSlot?.message}</>

          {!activeSlot?.isOverride && (
            <Stack w="100%">
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
              <Button onClick={editSlotsHandlers.open} variant="light">
                Edit Schedule
              </Button>
            </Stack>
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
    </>
  );
}
