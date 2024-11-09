/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { WASI } from "node:wasi";
import { readFile } from "node:fs/promises";
import { shouldStringNotEmpty } from "@xan105/is/assert";

export const VERSION = ["unstable", "preview1"];

export async function load(filePath, version){
//There is a proposal to be able to do ESM import
//eg: import Foo from "./foo.wasm" as wasm-module  
  
  shouldStringNotEmpty(filePath);
  shouldStringNotEmpty(version);

  const context = new WASI({ version });

  const buffer = await readFile(filePath);
  const module = await WebAssembly.compile(buffer); //future ?: WebAssembly.compileStreaming()
          
  const instance = await WebAssembly.instantiate(module, context.getImportObject());
  context.start(instance);
   
  return instance.exports;
}