import { useEffect, useState } from "react";
import Display from "./display";
import useSWR from "swr";
import { Button, Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

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
    setColors([...(matrixColors.size === 0 ? colors : []), ...matrixColors]);
  }, [JSON.stringify(matrix)]);
  return (
    <div style={{ display: "flex", width: "100%" }}>
      {colors.map((color) => (
        <Color
          color={color}
          setActiveColor={setActiveColor}
          activeColor={activeColor}
          key={color}
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

// @ts-ignore
export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function Composer() {
  const [scene, setScene] = useState<string | null>(null);

  const { data: scenes = [], mutate } = useSWR("api/scenes", fetcher);
  const { data: sceneData } = useSWR(
    scene && scene !== "new-scene" && `api/scenes/${scene}`,
    fetcher
  );

  const [activeColor, setActiveColor] = useState(null);
  const [matrix, setMatrix] = useState(null);

  const [opened, { open, close }] = useDisclosure();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "" },
  });

  useEffect(() => {
    if (!sceneData) return;
    setMatrix(sceneData);
  }, [JSON.stringify(sceneData)]);

  return (
    <Stack>
      <Select
        placeholder="Select a scene..."
        variant="filled"
        style={{ flex: 1 }}
        data={[
          { label: "New scene", value: "new-scene" },
          ...scenes?.map((scene: any) => ({
            label: scene,
            value: scene,
          })),
        ]}
        onChange={(value) => {
          if (value === "new-scene") {
            return open();
          }
          setScene(value);
        }}
      />
      <Modal title="New scene" opened={opened} onClose={close}>
        <form
          onSubmit={form.onSubmit((values) => {
            console.log(values);
            fetch(`/api/scenes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            setScene(values.name);
            mutate();
            close();
          })}
        >
          <TextInput
            label="Scene Name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit">Create</Button>
          </Group>
        </form>
      </Modal>

      {matrix && scene && (
        <>
          <div style={{ display: "flex" }}>
            <Palette
              activeColor={activeColor}
              setActiveColor={setActiveColor}
              matrix={matrix}
            />
            <button
              onClick={() => {
                fetch(`/api/scenes/${scene}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ scene: matrix }),
                });
              }}
            >
              Save
            </button>
          </div>
          <Display
            activeColor={activeColor}
            matrix={matrix}
            setMatrix={setMatrix}
          ></Display>
        </>
      )}
    </Stack>
  );
}
