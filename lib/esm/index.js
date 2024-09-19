"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const display_engine_1 = require("@bigdots-io/display-engine");
const rpi_led_matrix_1 = require("rpi-led-matrix");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const commander_1 = require("commander");
const program = new commander_1.Command();
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
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
const matrix = new rpi_led_matrix_1.LedMatrix(Object.assign(Object.assign({}, rpi_led_matrix_1.LedMatrix.defaultMatrixOptions()), { rows: options.rows, cols: options.cols, chainLength: options.chainLength, hardwareMapping: rpi_led_matrix_1.GpioMapping.Regular }), Object.assign(Object.assign({}, rpi_led_matrix_1.LedMatrix.defaultRuntimeOptions()), { gpioSlowdown: 1 }));
let updateQueue = [];
const engine = (0, display_engine_1.createDisplayEngine)({
    dimensions: {
        width: options.cols * options.chainLength,
        height: options.rows,
    },
    onPixelsChange: (pixels) => {
        updateQueue.push(pixels);
    },
});
function RGBAToHexA(rgba, forceRemoveAlpha = false) {
    const hexValues = [...rgba]
        .filter((number, index) => !forceRemoveAlpha || index !== 3)
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
            matrix
                .brightness(options.brightness)
                .fgColor(parseInt(pixel.rgba ? RGBAToHexA(pixel.rgba, true) : "000000", 16))
                .setPixel(pixel.x, pixel.y);
        }
    }
    setTimeout(() => matrix.sync(), 0);
});
matrix.sync();
engine.render([
    (0, display_engine_1.text)({
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
