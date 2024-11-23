import React, { useRef, useState } from "react";

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
        width: 20,
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

function Dot({
  y,
  x,
  onClick,
  onMouseOver,
  matrix,
}: {
  y: number;
  x: number;
  onClick: () => void;
  onMouseOver: any;
  matrix: any;
}) {
  return (
    <div
      data-coordinates={`${y}:${x}`}
      onClick={onClick}
      onMouseOver={onMouseOver}
      style={{
        backgroundColor: matrix[`${x}:${y}`] || "#000",
        height: "80%",
        width: "80%",
        display: "inline-block",
        borderRadius: 100,
        boxShadow: "1px 1px 1px #AAA",
      }}
    ></div>
  );
}

export default function Display({
  activeColor,
  matrix,
  setMatrix,
}: {
  activeColor: string | null;
  matrix: any;
  setMatrix: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouseDown, setMouseDown] = useState(false);

  const height = 32;
  const width = 32;

  const adjustedBrightness = (50 + 100 / 2) / 100;

  return (
    <>
      <div
        ref={ref}
        style={{ background: "#000", position: "relative" }}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
      >
        <div style={{ zIndex: 1, position: "relative" }}>
          {[...Array(height).keys()].map((y) => (
            <Row y={y} opacity={adjustedBrightness} key={`row_${y}`}>
              {[...Array(width).keys()].map((x) => (
                <Column y={y} x={x} key={`row_${y}_col_${x}`}>
                  <Dot
                    y={y}
                    x={x}
                    matrix={matrix}
                    onClick={() => {
                      setMatrix({
                        ...matrix,
                        [`${x}:${y}`]: activeColor,
                      });
                    }}
                    onMouseOver={() => {
                      if (!mouseDown) return;
                      setMatrix({
                        ...matrix,
                        [`${x}:${y}`]: activeColor,
                      });
                    }}
                  />
                </Column>
              ))}
            </Row>
          ))}
        </div>
        <img
          src="bunny.png"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0.5,
            zIndex: 0,
            width: "100%",
          }}
        />
      </div>
    </>
  );
}
