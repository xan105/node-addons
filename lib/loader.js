/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { dlopen } from "node:process";
import { constants, arch, platform } from "node:os";
import { exists } from "@xan105/fs";
import { Failure } from "@xan105/error";
import { isStringNotEmpty } from "@xan105/is";
import { shouldStringNotEmpty } from "@xan105/is/assert";

async function find(option = {}){
  
  const options = {
    name: isStringNotEmpty(option.name) ? option.name : "bindings",
    dir: isStringNotEmpty(option.dir) ? option.dir : ".",
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
  
  if (options.prebuild && !bindings) {
    const dirPath = join(options.dir, "prebuilds", `${platform()}-${arch()}`);
    const filePath = join(dirPath, `${options.name}.napi.node`);
    if (await exists(filePath)) {
      bindings = filePath;
    } else {
      checked.push(dirPath)
    }
  }
  
  if (!bindings) 
    throw new Failure(`Could not locate the bindings file "${options.name}". Tried:\n` + checked.join("\n"), "ERR_BINDINGS_NOT_FOUND");

  return bindings;
}

function load(bindings, flag = "RTLD_LAZY"){
  shouldStringNotEmpty(bindings);
  shouldStringNotEmpty(flag);

  const module = { exports: {} };
  dlopen(module, bindings, constants.dlopen[flag]);
  return module.exports;
}

export { find, load };