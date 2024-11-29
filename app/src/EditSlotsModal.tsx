import { useForm } from "@mantine/form";
import {
  Button,
  Card,
  Grid,
  Group,
  Input,
  Modal,
  NumberInput,
  Select,
  Stack,
} from "@mantine/core";
import useSWR from "swr";
import { fetcher } from "./App";
import { useEffect } from "react";

export interface Slot {
  name: string;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
  scene: any;
}

export function EditSlotsModal({
  opened,
  close,
  onSave,
}: {
  opened: boolean;
  close: () => void;
  onSave: () => void;
}) {
  const { data: slots, mutate: mutateSlots } = useSWR("api/slots", fetcher);
  const { data: scenes } = useSWR("api/scenes", fetcher);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: slots as { slots: Slot[] },
  });

  useEffect(() => {
    if (!slots) return;
    form.setValues(slots);
  }, [slots]);

  if (!slots || !scenes) return null;

  return (
    <Modal opened={opened} onClose={close} title="Edit Scheduled Slots">
      <form
        onSubmit={form.onSubmit((values) => {
          fetch("/api/slots", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          mutateSlots();
          onSave();
          close();
        })}
      >
        <Stack>
          {form.getValues().slots?.map((item, index) => (
            <Card key={`${item.name}-${index}`}>
              <Stack key={item.name}>
                <Grid gutter="lg">
                  <Grid.Col span={6}>
                    <Input.Wrapper label="Start time">
                      <Group gap="xs">
                        <NumberInput
                          placeholder="Hour"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          key={form.key(`slots.${index}.start.hour`)}
                          {...form.getInputProps(`slots.${index}.start.hour`)}
                        />
                        :
                        <NumberInput
                          placeholder="Minute"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          key={form.key(`slots.${index}.start.minute`)}
                          {...form.getInputProps(`slots.${index}.start.minute`)}
                        />
                      </Group>
                    </Input.Wrapper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Input.Wrapper label="End time">
                      <Group gap="xs">
                        <NumberInput
                          placeholder="Hour"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          key={form.key(`slots.${index}.end.hour`)}
                          {...form.getInputProps(`slots.${index}.end.hour`)}
                        />
                        :
                        <NumberInput
                          placeholder="Minute"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          key={form.key(`slots.${index}.end.minute`)}
                          {...form.getInputProps(`slots.${index}.end.minute`)}
                        />
                      </Group>
                    </Input.Wrapper>
                  </Grid.Col>
                </Grid>
                <Select
                  placeholder="Scene"
                  variant="filled"
                  style={{ flex: 1 }}
                  data={scenes?.map((scene: any) => ({
                    label: scene,
                    value: scene,
                  }))}
                  required
                  key={form.key(`slots.${index}.scene`)}
                  {...form.getInputProps(`slots.${index}.scene`)}
                />
                <Button
                  color="red"
                  onClick={() => form.removeListItem("slots", index)}
                >
                  Delete
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
        <Group justify="center" mt="md">
          <Button
            onClick={() =>
              form.insertListItem("slots", {
                start: { hour: "", minute: "" },
                end: { hour: "", minute: "" },
                scene: "moon",
              })
            }
          >
            Add Slot
          </Button>
        </Group>
        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  );
}
