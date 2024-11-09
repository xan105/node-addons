#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { env, arch, platform, exit, cwd } from "node:process";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const targetArch = env.npm_config_arch || arch;

async function hasPrebuild(){
  const locations = [
    "prebuild", 
    "prebuilds"
  ];

  for (const location of locations){
    const dirPath = join(cwd(), location, `${platform}-${targetArch}`);
    for await (const entry of glob("*.node", { cwd: dirPath })){ //node20: experimental
      return true;
    }
  }
  return false;
}

const override = env.npm_config_build_from_source === "true";
if (override || await hasPrebuild() === false)
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