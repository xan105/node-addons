/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { createRequire } from "node:module";
import { arch, platform, cwd } from "node:process";
import { exists } from "@xan105/fs";
import { Failure } from "@xan105/error";
import { asStringNotEmpty } from "@xan105/is/opt";
import { shouldObj, shouldStringNotEmpty } from "@xan105/is/assert";

async function find(option = {}){
  
  shouldObj(option);
  const options = {
    name: asStringNotEmpty(option.name) ?? "bindings",
    cwd: asStringNotEmpty(option.cwd) ?? cwd()
  };

  const locations = [
    "build/Debug",
    "build/Release",
    `prebuild/${platform}-${arch}`,
    `prebuilds/${platform}-${arch}`
  ];

  const checked = [];
  if (!options.name.endsWith(".node")) options.name += ".node";
  let bindings;
  
  for (const location of locations){
    const dirPath = join(options.cwd, location);
    const filePath = join(dirPath, options.name);
    if (await exists(filePath)) {
      bindings = filePath;
      break;
    } else {
      bindings = null;
      checked.push(dirPath)
    }
  }
  
  if (!bindings) {
    throw new Failure(`Could not locate the bindings file "${options.name}"`, { 
      code: "ERR_BINDINGS_NOT_FOUND",
      info: checked
    });
  } 

  return bindings;
}

function load(bindings){
  shouldStringNotEmpty(bindings);

  //Native modules are not currently supported with ES module imports
  //They can instead be loaded with module.createRequire or process.dlopen
  //CJS require() ensures that the returned value is a singleton for each file unlike dlopen()
  //As such when calling dlopen() twice on an addon, it will either fail or give you a new instance of the module.
  
  const require = createRequire(import.meta.url);
  const module = require(bindings);
  return module;
  
  /*
  const module = { exports: {} };
  dlopen(module, bindings, constants.dlopen[flag]);
  return module.exports;
  */
}

async function dlopen(option){
  const bindings = await find(option);
  return load(bindings);
}

export { find, load, dlopen };