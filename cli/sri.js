#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { parseArgs } from "node:util";
import { cwd, exit } from "node:process";
import { glob } from "node:fs/promises";
import { hashFile } from "@xan105/fs";

async function compute(algo){
  const files = glob(["**/*.node", "**/*.wasm"], { //node20: experimental 
    cwd: cwd(), 
    exclude: (path) => path.includes("node_modules")
  });
  for await (const file of files){
    const hash = await hashFile(file, { algo, base64: true });
    console.info({ path: file, algo, hash });
  }
}

const { values: args } = parseArgs({
  options:{
    algo: {
      type: "string",
      default: "sha384"
    }
  } 
});

compute(args.algo)
.then(()=>{
  exit(0);
})
.catch((err)=>{
  console.error(err);
  exit(1);
});