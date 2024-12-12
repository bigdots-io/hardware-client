import useSWR from "swr";
import {
  Button,
  Card,
  Grid,
  Group,
  Input,
  NumberInput,
  Select,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";

// @ts-ignore
export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function Presets() {
  const { data: presets, mutate: mutateSlots } = useSWR("api/presets", fetcher);
  const { data: scenes } = useSWR("api/scenes", fetcher);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: [],
  });

  return (
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
        {form.getValues().presets?.map((item, index) => (
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
  );
}
