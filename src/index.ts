import { createDisplayEngine, text } from "@bigdots-io/display-engine";
import { GpioMapping, LedMatrix } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(bodyParser.json());

const matrix = new LedMatrix(
  {
    ...LedMatrix.defaultMatrixOptions(),
    rows: 16,
    cols: 32,
    chainLength: 3,
    hardwareMapping: GpioMapping.Regular,
  },
  {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 1,
  }
);

const engine = createDisplayEngine({
  dimensions: { width: 96, height: 16 },
  onPixelsChange: (pixels) => {
    for (const pixel of pixels) {
      matrix
        .brightness(pixel.brightness * 10)
        .fgColor(
          parseInt(pixel.hex ? pixel.hex.replace(/^#/, "") : "000000", 16)
        )
        .setPixel(pixel.x, pixel.y);
    }

    matrix.sync();
  },
});

engine.render([
  text({
    text: "Ready!",
    color: "#FFFFFF",
    brightness: 1,
  }),
]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/macros", (req, res) => {
  engine.render(req.body.macros);
  res.status(204).send("received");
});

app.listen(port, () => {
  console.log(`BigDots listening on port ${port}`);
});
