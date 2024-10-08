import { createDisplayEngine, text } from "@bigdots-io/display-engine";
import { GpioMapping, LedMatrix } from "rpi-led-matrix";
import express from "express";
import bodyParser from "body-parser";
import { Command } from "commander";
const program = new Command();
program
    .name("bigdots")
    .description("Power a hardware LED board")
    .version("0.1.0");
program
    .option("--rows <number>")
    .option("--cols <number>")
    .option("--brightness <number>")
    .option("--chain-length <number>");
program.parse(process.argv);
const options = program.opts();
console.log({ options });
const app = express();
const port = 3000;
app.use(bodyParser.json());
const matrix = new LedMatrix(Object.assign(Object.assign({}, LedMatrix.defaultMatrixOptions()), { rows: parseInt(options.rows, 10), cols: parseInt(options.cols, 10), chainLength: parseInt(options.chainLength, 10), hardwareMapping: GpioMapping.Regular }), Object.assign(Object.assign({}, LedMatrix.defaultRuntimeOptions()), { gpioSlowdown: 1 }));
let updateQueue = [];
const engine = createDisplayEngine({
    dimensions: {
        width: parseInt(options.cols, 10) * options.chainLength,
        height: parseInt(options.rows, 10),
    },
    onPixelsChange: (pixels) => {
        updateQueue.push(pixels);
    },
});
function RGBAToHexA(rgba, forceRemoveAlpha = false) {
    const hexValues = [...rgba]
        .filter((_number, index) => !forceRemoveAlpha || index !== 3)
        .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
        .map((number) => number.toString(16));
    return ("#" +
        hexValues
            .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
            .join(""));
}
matrix.afterSync((mat, dt, t) => {
    if (updateQueue.length > 0) {
        console.log("Queue:", updateQueue.length);
    }
    const pixelUpdates = updateQueue.shift();
    if (pixelUpdates) {
        for (const pixel of pixelUpdates) {
            console.log(pixel);
            matrix
                .brightness(options.brightness)
                .fgColor(parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16))
                .setPixel(pixel.x, pixel.y);
        }
    }
    //setTimeout(() => matrix.sync(), 0);
});
matrix.sync();
engine.render([
    text({
        text: "Ready!",
        color: "#FFFFFF",
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
