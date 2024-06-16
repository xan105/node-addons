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

  const dirPath = join(
    cwd(), 
    "prebuilds", 
    `${platform}-${targetArch}`
  );
  
  const files = await ls(dirPath, { 
    ignore: { dir : true },
    ext: ["node"]
  });
  
  return files.length > 0;
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