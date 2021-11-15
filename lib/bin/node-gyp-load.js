#!/usr/bin/env node

import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
import { arch, platform } from 'node:os';
import { exists } from "@xan105/fs";
import glob from "fast-glob";

console.log(resolve("."));
console.log(process.argv);
console.log(process.env);

const found = await hasPrebuild(".");
if (buildFromSource() || !found) {
  const gyp = spawn("node-gyp", ["rebuild"],{ cwd: ".", stdio: "inherit", shell: true });
  gyp.on('exit', code => process.exit(code));
}

async function hasPrebuild(dir){
  const dirPath = join(dir, "prebuilds", `${platform()}-${arch()}`);
  if (!await exists(dirPath)) return false;
  const files = await glob(/.*\.node/, { cwd: dirPath });
  return files.length > 0 ? true : false;
}

function hasFlag(flag) {
  if (!process.env.npm_config_argv) return false
  try {
    const { original } = JSON.parse(process.env.npm_config_argv);
    return original.indexOf(flag) !== -1;
  } catch {
    return false
  }
}

function buildFromSource() {
  return hasFlag('--build-from-source') || process.env.npm_config_build_from_source === 'true'
}