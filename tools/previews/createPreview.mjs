import fs from "fs";
import { createCanvas, registerFont } from "canvas";

const title = process.argv[2];

const lowercaseTitle = title.toLowerCase();

const formattedTitle = lowercaseTitle.replace(/\s+/g, "-");

if (title) {
  registerFont("Silkscreen-Regular.ttf", { family: "Silkscreen" });

  const stageWidth = 1200;
  const stageHeight = 630;

  const canvas = createCanvas(stageWidth, stageHeight);
  const ctx = canvas.getContext("2d");

  const fontSize = 72;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, stageWidth, stageHeight);

  ctx.font = `${fontSize}px "Silkscreen"`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(title, stageWidth * 0.5, stageHeight * 0.5);

  const png = canvas.toBuffer("image/png", { compressionLevel: 3 });
  fs.writeFileSync(`${formattedTitle}.png`, png);
}
