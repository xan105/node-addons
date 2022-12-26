#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { spawn } from "node:child_process";
import { arch, platform } from "node:os";
import { ls } from "@xan105/fs";

function forceBuild() {
  return process.env.npm_config_build_from_source === "true";
}

async function hasPrebuild(dir = "."){
  const dirPath = join(dir, "prebuilds", `${platform()}-${arch()}`);
  const files = await ls(dirPath, { ignore: { dir : true }, ext: ["node"] });
  return files.length > 0;
}

//Exec
if (forceBuild() || await hasPrebuild() === false) {
  const gyp = spawn("node-gyp", ["rebuild"], { 
    cwd: ".", 
    stdio: "inherit", 
    shell: true 
  });
  
  gyp.once("error", (err) => {
    throw err;
  });
  
  gyp.once("spawn", () => {
    gyp.once("exit", code => process.exit(code));
  });
}