/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { cwd } from "node:process";
import { extname } from "node:path";
import { isBasename } from "@xan105/fs/path";
import { shouldObj, shouldStringNotEmpty } from "@xan105/is/assert";
import { asStringNotEmpty, asStringLike }  from "@xan105/is/opt";
import { verify } from "./util/sri.js";
import * as NAPI from "./napi.js";
import * as WASI from "./wasi.js";

export async function dlopen(filePath, option = {}){
  shouldStringNotEmpty(filePath);
  shouldObj(option);
  
  const options = {
    cwd: asStringNotEmpty(option.cwd) ?? cwd(),
    integrity: asStringLike(option.integrity, "SRI") ?? "",
    version: WASI.VERSION.includes(option.version) ? option.version : WASI.VERSION.at(-1)
  };

  switch(extname(filePath)){
    case ".node":
    {
      let skipIntegrity = false;
      if (isBasename(filePath)){
        const bindings = await NAPI.find(filePath, options.cwd);
        filePath = bindings.path;
        skipIntegrity = !bindings.isPrebuild;
      }
      
      if(options.integrity && !skipIntegrity){
        await verify(filePath, options.integrity);
      }
      
      const module = NAPI.load(filePath);
      return module;
    }
    case ".wasm":
    {
      if(options.integrity){
        await verify(filePath, options.integrity);
      }
      
      const exports = await WASI.load(filePath, options.version);
      return exports;
    }
    default: {
      throw new Failure("Unknown addon type", 3);
    }
  }
}