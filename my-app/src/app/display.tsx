import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Macro,
  MacroConfig,
  MacroName,
  Pixel,
} from "@bigdots-io/display-engine";
import { createDisplayEngine } from "@bigdots-io/display-engine";

export function updateDot(
  element: HTMLDivElement,
  dotElMap: { [k: string]: any },
  { y, x, rgba }: Pixel
) {
  let el: any;

  el = dotElMap[`${x}:${y}`];

  if (!el) {
    el = element.querySelectorAll(`[data-coordinates='${y}:${x}']`);
    dotElMap[`${x}:${y}`] = el;
  }

  if (el.length > 0) {
    const backgroundColor = rgba
      ? ((
          el[0] as HTMLElement
        ).style.background = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]}`)
      : "#444"; // inactive pixel color
    (el[0] as HTMLElement).style.background = backgroundColor;
  }
}

function Row({
  children,
  opacity,
}: {
  y: number;
  opacity: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        opacity,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function Column({
  y,
  x,
  children,
}: {
  y: number;
  x: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 10,
        textAlign: "center",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1/1",
      }}
      key={`row_${y}_col_${x}`}
    >
      {children}
    </div>
  );
}

function Dot({ y, x, blocky }: { y: number; x: number; blocky: boolean }) {
  return (
    <div
      data-coordinates={`${y}:${x}`}
      style={{
        backgroundColor: "#000",
        display: "inline-block",
        ...(blocky
          ? { height: "100%", width: "100%" }
          : {
              height: "60%",
              width: "60%",
              borderRadius: 100,
              boxShadow: "1px 1px 1px #AAA",
            }),
      }}
    ></div>
  );
}

type MacroNameType = `${MacroName}`;

export default function Display({
  layers,
  dimensions,
  devMode = false,
  blocky = false,
}: {
  layers: Macro[];
  macroName?: MacroNameType;
  macroConfig?: Partial<MacroConfig>;
  dimensions: Dimensions;
  devMode?: boolean;
  blocky: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [engine, setEngine] = useState<any>();
  const [stop, setStop] = useState<any>();

  useEffect(() => {
    const dotElMap: { [k: string]: any } = {};

    setEngine(
      createDisplayEngine({
        dimensions,
        onPixelsChange: (pixels) => {
          pixels.forEach((pixel) => {
            if (ref.current === null) return;
            updateDot(ref.current, dotElMap, pixel);
          });
        },
      })
    );
  }, []);

  useEffect(() => {
    renderDisplay();
  }, [engine, JSON.stringify(layers)]);

  const renderDisplay = useCallback(() => {
    if (!engine) return;
    const halt = engine?.render(layers);
    setStop(() => halt);
  }, [engine, JSON.stringify(layers), setStop]);

  const { height, width } = dimensions;

  const adjustedBrightness = (50 + 100 / 2) / 100;

  return (
    <>
      <div ref={ref} style={{ background: "#000" }}>
        {devMode && (
          <>
            <button onClick={() => stop()}>Stop</button>
            <button onClick={() => renderDisplay()}>Reload</button>
          </>
        )}
        {[...Array(height).keys()].map((y) => (
          <Row y={y} opacity={adjustedBrightness} key={`row_${y}`}>
            {[...Array(width).keys()].map((x) => (
              <Column y={y} x={x} key={`row_${y}_col_${x}`}>
                <Dot y={y} x={x} blocky={blocky} />
              </Column>
            ))}
          </Row>
        ))}
      </div>
    </>
  );
}
