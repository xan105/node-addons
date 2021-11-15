/*
MIT License

Copyright (c) 2021 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

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