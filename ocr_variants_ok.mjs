import sharp from "sharp";
import { createWorker } from "tesseract.js";

const source = "./src/img/Billetes_Inhabilitados_OK.jpg";

const variants = [
  {
    name: "v1",
    process: (image) =>
      image
        .resize({ width: 3800 })
        .grayscale()
        .normalise()
        .sharpen({ sigma: 1.6 }),
  },
  {
    name: "v2",
    process: (image) =>
      image.resize({ width: 3800 }).grayscale().normalise().threshold(165),
  },
  {
    name: "v3",
    process: (image) =>
      image
        .resize({ width: 4200 })
        .grayscale()
        .normalise()
        .modulate({ brightness: 1.1 })
        .sharpen({ sigma: 1.2 }),
  },
];

const worker = await createWorker("eng+spa");

for (const variant of variants) {
  const output = `./src/img/_${variant.name}_ok.png`;
  await variant.process(sharp(source)).toFile(output);

  for (const mode of ["4", "6", "11"]) {
    await worker.setParameters({
      tessedit_pageseg_mode: mode,
      preserve_interword_spaces: "1",
    });

    const { data } = await worker.recognize(output);
    console.log(`\n===== ${variant.name} PSM ${mode} =====\n`);
    console.log(data.text);
  }
}

await worker.terminate();
