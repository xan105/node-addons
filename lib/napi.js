/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { createRequire } from "node:module";
import { arch, platform } from "node:process";
import { join } from "node:path";
import { exists } from "@xan105/fs";
import { Failure } from "@xan105/error";
import { shouldStringNotEmpty } from "@xan105/is/assert"

export async function find(module, cwd){
  shouldStringNotEmpty(module);
  shouldStringNotEmpty(cwd);
  
  if (!module.endsWith(".node")) module += ".node";

  const locations = [
    "build/Debug",
    "build/Release",
    `prebuild/${platform}-${arch}`,
    `prebuilds/${platform}-${arch}`
  ];

  const checked = [];
  const bindings = Object.create(null);

  for (const [ index, location ] of locations.entries()){
    const dirPath = join(cwd, location);
    const filePath = join(dirPath, module);
    if (await exists(filePath)) {
      bindings.path = filePath;
      bindings.isPrebuild = [2,3].includes(index);
      break;
    } else {
      bindings.path = null;
      bindings.isPrebuild = false;
      checked.push(dirPath);
    }
  }
  
  if (!bindings.path) {
    throw new Failure(`Could not locate the bindings file "${module}"`, { 
      code: "ERR_BINDINGS_NOT_FOUND",
      info: checked
    });
  } 

  return bindings;
}

export function load(filePath){
//Maybe someday when the JSON and WebAssembly import spec has settle;
//ESM would be able to load .node directly

  shouldStringNotEmpty(filePath);

  const require = createRequire(import.meta.url);
  const module = require(filePath);
  return module;
}