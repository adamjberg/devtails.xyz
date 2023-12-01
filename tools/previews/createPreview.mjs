import fs from "fs";
import { createCanvas, registerFont } from "canvas";

let title = process.argv[2];
title = title.replace(/\\n/g, "\n");

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

  const measured = ctx.measureText(title);
  console.log(measured);

  ctx.fillText(
    title,
    stageWidth * 0.5,
    (stageHeight - measured.emHeightDescent) * 0.5
  );

  const png = canvas.toBuffer("image/png", { compressionLevel: 3 });

  const formattedTitle = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\n/g, "-");
  fs.writeFileSync(`../../assets/img/${formattedTitle}.png`, png);
}
