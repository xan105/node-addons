#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { spawn } from "node:child_process";
import { env, arch, platform, exit, cwd } from "node:process";
import { ls } from "@xan105/fs";
import { asStringNotEmpty } from "@xan105/is/opt";

const targetArch = asStringNotEmpty(env.npm_config_arch) ?? arch;

async function hasPrebuild(){

  const locations = [
    `prebuild/${platform}-${targetArch}`,
    `prebuilds/${platform}-${targetArch}`
  ];

  for (const location of locations){
    const dirPath = join(cwd(), location);
    
    const files = await ls(dirPath, { 
      ignore: { dir : true },
      ext: ["node"]
    });
    
    if (files.length > 0) return true;
  }
  return false;
}

//Exec
if (env.npm_config_build_from_source === "true" || await hasPrebuild() === false) 
{
  const gyp = spawn("node-gyp", ["rebuild", "--arch", targetArch], { 
    cwd: cwd(), 
    stdio: "inherit", 
    shell: true 
  });
  
  gyp.once("error", (err) => {
    console.error(err);
    exit(1);
  });
  
  gyp.once("spawn", () => {
    gyp.once("exit", code => exit(code));
  });
}