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
import { updateScheduledSlots } from "./server/actions";
import { Slot } from "./types";
import { DataKey, DataTypes } from "./server/db";

export function EditSlotsModal({
  opened,
  close,
  scheduledSlots,
  scenes,
}: {
  opened: boolean;
  close: () => void;
  scheduledSlots: Slot[];
  scenes: string[];
}) {
  const form = useForm<{ slots: DataTypes[DataKey.ScheduledSlots] }>({
    mode: "uncontrolled",
    initialValues: { slots: scheduledSlots },
  });

  return (
    <Modal opened={opened} onClose={close} title="Edit Scheduled Slots">
      <form
        onSubmit={form.onSubmit((values) => {
          updateScheduledSlots(values.slots);
          close();
        })}
      >
        <Stack>
          {form.getValues().slots.map((item, index) => (
            <Card key={`${item.scene}-${index}`}>
              <Stack key={item.scene}>
                <Grid gutter="lg">
                  <Grid.Col span={6}>
                    <Input.Wrapper label="Start time">
                      <Group gap="xs">
                        <NumberInput
                          placeholder="Hour"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          name={`slots.${index}.start.hour`}
                          key={form.key(`slots.${index}.start.hour`)}
                          {...form.getInputProps(`slots.${index}.start.hour`)}
                        />
                        :
                        <NumberInput
                          placeholder="Minute"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          name={`slots.${index}.start.minute`}
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
                          name={`slots.${index}.end.hour`}
                          key={form.key(`slots.${index}.end.hour`)}
                          {...form.getInputProps(`slots.${index}.end.hour`)}
                        />
                        :
                        <NumberInput
                          placeholder="Minute"
                          variant="filled"
                          style={{ flex: 1 }}
                          required
                          name={`slots.${index}.end.minute`}
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
                  data={scenes?.map((scene) => ({
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
