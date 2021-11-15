import { join } from "node:path";
import { dlopen } from 'node:process';
import { constants, arch, platform } from 'node:os';
import { exists } from "@xan105/fs";
import { Failure } from "../util/error.js";

async function find(option = {}){
  
  const options = {
    name: option.name || "bindings",
    dir: option.dir || ".",
    prebuild: option.prebuild ?? true
  };
  
  const locations = [
    "build/Debug",
    "build/Release"
  ];
  
  let bindings;
  let checked = [];
  
  for (const location of locations){
    const dirPath = join(options.dir,location);
    const filePath = join(dirPath,`${options.name}.node`);
    if (await exists(filePath)) {
      bindings = filePath;
      break;
    } else {
      checked.push(dirPath)
    }
  }
  
  if (options.prebuild) {
    const dirPath = join(options.dir, "prebuilds", `${platform()}-${arch()}`);
    const filePath = join(dirPath, `${options.name}.napi.node`);
    if (await exists(filePath)) {
      bindings = filePath;
    } else {
      checked.push(dirPath)
    }
  }
  
  if (!bindings) throw new Failure(`Could not locate the bindings file "${options.name}". Tried:\n` + checked.join("\n"), "ERR_BINDINGS_NOT_FOUND");

  return bindings;
}

function load(bindings){
  const module = { exports: {} };
  dlopen(module, bindings, constants.dlopen.RTLD_LAZY);
  return module.exports;
}

export { find, load };