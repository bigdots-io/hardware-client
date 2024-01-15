import { createDisplayEngine, text } from "@bigdots-io/display-engine";
import { GpioMapping, LedMatrix } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
app.use(bodyParser.json());
const matrix = new LedMatrix(Object.assign(Object.assign({}, LedMatrix.defaultMatrixOptions()), { rows: 16, cols: 32, chainLength: 3, hardwareMapping: GpioMapping.Regular }), Object.assign(Object.assign({}, LedMatrix.defaultRuntimeOptions()), { gpioSlowdown: 1 }));
let updateQueue = [];
const engine = createDisplayEngine({
    dimensions: { width: 96, height: 16 },
    onPixelsChange: (pixels) => {
        updateQueue.push(pixels);
    },
});
matrix.afterSync((mat, dt, t) => {
    console.log("queue", updateQueue.length);
    if (updateQueue.length === 0)
        return;
    const pixelUpdates = updateQueue.shift();
    if (!pixelUpdates)
        return;
    for (const pixel of pixelUpdates) {
        matrix
            .brightness(pixel.brightness * 10)
            .fgColor(parseInt(pixel.hex ? pixel.hex.replace(/^#/, "") : "000000", 16))
            .setPixel(pixel.x, pixel.y);
    }
    setTimeout(() => matrix.sync(), 0);
});
matrix.sync();
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
