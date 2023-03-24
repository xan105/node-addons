/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { constants } from "node:os";
import { dlopen, arch, platform } from "node:process";
import { exists } from "@xan105/fs";
import { Failure } from "@xan105/error";
import { asBoolean, asStringNotEmpty } from "@xan105/is/opt";
import { shouldObj, shouldStringNotEmpty } from "@xan105/is/assert";

async function find(option = {}){
  
  shouldObj(option);
  const options = {
    name: asStringNotEmpty(option.name) ?? "bindings",
    dir: asStringNotEmpty(option.dir) ?? ".",
    prebuild: asBoolean(option.prebuild) ?? true
  };
  
  const locations = [
    "build/Debug",
    "build/Release"
  ];
  
  let bindings;
  const checked = [];
  
  for (const location of locations){
    const dirPath = join(options.dir,location);
    const filePath = join(dirPath,`${options.name}.node`);
    if (await exists(filePath)) {
      bindings = filePath;
      break;
    } else {
      bindings = null;
      checked.push(dirPath)
    }
  }
  
  if (options.prebuild && !bindings) {
    const dirPath = join(options.dir, "prebuilds", `${platform}-${arch}`);
    const filePath = join(dirPath, `${options.name}.napi.node`);
    if (await exists(filePath)) {
      bindings = filePath;
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

function load(bindings, flag = "RTLD_LAZY"){
  shouldStringNotEmpty(bindings);
  shouldStringNotEmpty(flag);
  
  //Native modules are not currently supported with ES module imports
  //They can instead be loaded with process.dlopen
  const module = { exports: {} };
  dlopen(module, bindings, constants.dlopen[flag]);
  return module.exports;
}

export { find, load };