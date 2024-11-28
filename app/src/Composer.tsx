import { useEffect, useState } from "react";
import Display from "./display";
import useSWR from "swr";
import { Select } from "@mantine/core";

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

// @ts-ignore
export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function Composer() {
  const [scene, setScene] = useState("moon");

  const { data: scenes } = useSWR("api/scenes", fetcher);
  const { data: sceneData } = useSWR(scene && `api/scenes/${scene}`, fetcher);

  const [activeColor, setActiveColor] = useState(null);
  const [matrix, setMatrix] = useState({});

  useEffect(() => {
    if (!sceneData) return;
    setMatrix(sceneData);
  }, [JSON.stringify(sceneData)]);

  return (
    <div>
      <Select
        placeholder="Scene"
        variant="filled"
        style={{ flex: 1 }}
        data={scenes?.map((scene: any) => ({
          label: scene,
          value: scene,
        }))}
        onChange={(value) => {
          setScene(value as string);
        }}
      />
      <div style={{ display: "flex" }}>
        <Palette
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          matrix={matrix}
        />
        <button
          onClick={() => {
            fetch(`/api/scenes/${scene}`, {
              method: "POST",
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
    </div>
  );
}
