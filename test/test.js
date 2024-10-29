import { join } from "node:path";
import { dlopen } from "../lib/index.js";

const cwd = join(import.meta.dirname, "/sample/wasi");

const samples = [
  "golang/build/Debug/hello-world.wasm",
  "rust/build/Debug/hello-world.wasm"
];

for (const sample of samples){
  const addonPath = join(cwd, sample);
  const module = await dlopen(addonPath);
  console.log(module);
}