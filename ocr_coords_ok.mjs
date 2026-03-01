import { createWorker } from "tesseract.js";

const worker = await createWorker("eng+spa");
await worker.setParameters({
  tessedit_pageseg_mode: "4",
  preserve_interword_spaces: "1",
});

const { data } = await worker.recognize("./src/img/_ok_processed.png");

const words = (data.words ?? [])
  .filter((entry) => /\d{5,}/.test(entry.text))
  .map((entry) => ({
    text: entry.text,
    x: entry.bbox.x0,
    y: entry.bbox.y0,
  }))
  .sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y;
    }

    return left.x - right.x;
  });

for (const word of words) {
  console.log(`${word.y}\t${word.x}\t${word.text}`);
}

await worker.terminate();
