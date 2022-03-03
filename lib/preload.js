#!/usr/bin/env node

/*
MIT License

Copyright (c) Anthony Beaumont

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