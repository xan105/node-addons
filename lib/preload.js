#!/usr/bin/env node

/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { join } from "node:path";
import { spawn } from "node:child_process";
import { arch, platform } from "node:os";
import { exists } from "@xan105/fs";
import glob from "fast-glob";

// From https://github.com/prebuild/node-gyp-build (MIT License)
function hasFlag(flag) {
  if (!process.env.npm_config_argv) return false
  try {
    const { original } = JSON.parse(process.env.npm_config_argv);
    return original.indexOf(flag) !== -1;
  } catch {
    return false
  }
}

function forceBuild() {
  return hasFlag('--build-from-source') || process.env.npm_config_build_from_source === 'true'
}
//end of prebuild/node-gyp-build

async function hasPrebuild(dir = "."){
  const dirPath = join(dir, "prebuilds", `${platform()}-${arch()}`);
  if (!await exists(dirPath)) return false;
  const files = await glob("*.node", { cwd: dirPath });
  return files.length > 0 ? true : false;
}

//Exec
if (forceBuild() || !await hasPrebuild()) {
  const gyp = spawn("node-gyp", ["rebuild"],{ cwd: ".", stdio: "inherit", shell: true });
  gyp.on('exit', code => process.exit(code));
}